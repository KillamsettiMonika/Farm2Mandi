from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
import glob
import pickle
import logging

# ==============================
# CONFIG
# ==============================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

model_cache = {}
model_metadata = {}

# ==============================
# MODEL CLASS
# ==============================
class MLPredictor:
    def __init__(self, models_path="farm2mandi_models"):
        self.models_path = models_path
        self.load_model_metadata()

    def load_model_metadata(self):
        """Load all model metadata from .h5 files in the models directory"""
        models_dir = os.path.join(os.path.dirname(__file__), self.models_path)

        if not os.path.exists(models_dir):
            logger.error(f"Models directory not found: {models_dir}")
            return

        pattern = os.path.join(models_dir, "*.h5")
        model_files = glob.glob(pattern)

        logger.info(f"Found {len(model_files)} models in {models_dir}")

        for model_path in model_files:
            filename = os.path.basename(model_path)

            # Parse filename: "Commodity_Market APMC_model.h5"
            # Example: "Red Gram_Adoni APMC_model.h5"
            clean_name = filename.replace('_model.h5', '').replace('.h5', '')
            
            # Remove " APMC" suffix
            if ' APMC' in clean_name:
                clean_name = clean_name.replace(' APMC', '')
            
            # Split by last underscore to separate commodity and market
            # "Red Gram_Adoni" -> commodity="Red Gram", market="Adoni"
            last_underscore = clean_name.rfind('_')
            if last_underscore != -1:
                commodity = clean_name[:last_underscore].strip()
                market = clean_name[last_underscore+1:].strip()
            else:
                commodity = clean_name
                market = "unknown"

            model_metadata[filename] = {
                'path': model_path,
                'commodity': commodity.lower(),
                'market': market.lower()
            }
            logger.info(f"Parsed model: commodity='{commodity.lower()}' market='{market.lower()}' from {filename}")

    def find_best_model(self, commodity, market):
        """Find the best matching model for a given commodity and market"""
        commodity = commodity.lower().strip()
        market = market.lower().strip()

        logger.info(f"Searching for model: commodity='{commodity}', market='{market}'")
        logger.info(f"Available models: {list(model_metadata.keys())[:5]}...")

        best_match = None
        for filename, meta in model_metadata.items():
            meta_commodity = meta['commodity'].strip().lower()
            meta_market = meta['market'].strip().lower()
            
            # Check if commodity matches (exact or partial)
            commodity_matches = (
                meta_commodity == commodity or
                commodity in meta_commodity or
                meta_commodity in commodity
            )
            
            # Check if market matches
            market_matches = market in meta_market or meta_market in market
            
            if commodity_matches and market_matches:
                logger.info(f"Found matching model: {filename}")
                return filename
            
            # If market doesn't match but commodity does, save as fallback
            if commodity_matches and best_match is None:
                best_match = filename

        # If no exact market match, use commodity-only match
        if best_match:
            logger.info(f"Using fallback model (commodity only): {best_match}")
            return best_match

        logger.error(f"No model found for commodity='{commodity}', market='{market}'")
        raise Exception(f"No model found for {commodity} in {market}")

    def load_model(self, filename):
        """Load a model from cache or disk"""
        if filename in model_cache:
            return model_cache[filename]

        path = model_metadata[filename]['path']
        logger.info(f"Loading model from: {path}")
        model = tf.keras.models.load_model(path, compile=False)
        model.compile(optimizer='adam', loss='mse')

        model_cache[filename] = model
        return model

    def predict_price(self, commodity, market, dummy_prices=None):
        """Predict price for a commodity in a market"""
        
        filename = self.find_best_model(commodity, market)
        model = self.load_model(filename)

        # Load scaler
        scaler_path = model_metadata[filename]['path'].replace('_model.h5', '_scaler.pkl')
        if not os.path.exists(scaler_path):
            raise Exception(f"Scaler file not found: {scaler_path}")
        
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)

        # Get sequence length from model
        seq_len = model.input_shape[1]

        # Use dummy recent prices (since we don't have real historical data)
        if dummy_prices is None:
            dummy_prices = np.random.uniform(3000, 8000, seq_len)
        
        # Scale the prices
        scaled = scaler.transform(np.array(dummy_prices).reshape(-1, 1))

        # Reshape for model input
        input_data = scaled.reshape(1, seq_len, 1)

        # Make prediction
        pred = model.predict(input_data, verbose=0)
        price = scaler.inverse_transform(pred)[0][0]

        return {
            "predicted_price": round(float(price), 2),
            "model_used": filename,
            "seq_len": seq_len,
            "commodity": commodity,
            "market": market
        }


predictor = MLPredictor()

# ==============================
# ROUTES
# ==============================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "models_loaded": len(model_metadata),
        "models": {filename: meta for filename, meta in list(model_metadata.items())[:10]}
    })


@app.route('/models', methods=['GET'])
def list_models():
    """List all available models"""
    return jsonify({
        "total": len(model_metadata),
        "models": {filename: meta for filename, meta in model_metadata.items()}
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Predict price for a commodity"""
    try:
        data = request.get_json()

        commodity = data.get('commodity', '').strip()
        market = data.get('market', 'Adoni').strip()  # Default market

        if not commodity:
            return jsonify({"success": False, "error": "Missing commodity"}), 400

        logger.info(f"Prediction request: commodity='{commodity}', market='{market}'")
        
        result = predictor.predict_price(commodity, market)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route('/predict/<commodity>', methods=['GET'])
def predict_get(commodity):
    """Predict price for a commodity (GET request)"""
    try:
        market = request.args.get('market', 'Adoni')
        
        result = predictor.predict_price(commodity, market)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


# ==============================
# RUN
# ==============================
if __name__ == '__main__':
    app.run(port=5001, debug=True)
