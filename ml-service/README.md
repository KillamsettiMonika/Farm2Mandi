# Farm2Mandi ML Service

🤖 **Python-based Machine Learning service for price predictions using TensorFlow**

## 🎯 Features

- **TensorFlow/Keras Model Loading**: Loads your .h5 model files automatically
- **REST API**: Flask-based service with multiple prediction endpoints  
- **Model Caching**: Efficient model loading and caching system
- **Error Handling**: Robust error handling with detailed logging
- **CORS Support**: Ready for integration with Node.js backend
# FXTE5SET3G6JSTNZLU4N9SE1
## 📁 Project Structure

```
ml-service/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── setup.bat          # Windows setup script
├── test_service.py    # Service testing script
└── README.md          # This file
```

## 🚀 Quick Start

### 1. Setup Environment

**Windows:**
```bash
# Run the setup script
setup.bat
```

**Manual Setup:**
```bash
# Install dependencies
pip install -r requirements.txt
```

### 2. Start ML Service

```bash
python app.py
```

Service will start on: `http://127.0.0.1:5001`

### 3. Test Service

```bash
python test_service.py
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```
Returns service status and TensorFlow version

### List Models
```http
GET /models
```
Returns all available ML models

### Predict Price (POST)
```http
POST /predict
Content-Type: application/json

{
  "commodity": "Rice",
  "date": "2026-02-15", 
  "market_name": "Kurnool",
  "quantity": 1000
}
```

### Predict Price (GET)
```http
GET /predict/Rice?date=2026-02-15&market=Kurnool&quantity=1000
```

## 🔧 Integration with Node.js Backend

The Node.js backend automatically calls this Python service:

1. **Primary**: Python ML service for accurate predictions
2. **Fallback**: Pattern-based prediction if service unavailable
3. **Robust**: Retry logic with exponential backoff

## 📊 Model Requirements

Place your `.h5` model files in: `../frontend/farm2mandi_models/`

Expected format: `{Commodity}_{Market}_model.h5`
- Example: `Rice_Kurnool APMC_model.h5`
- Example: `Banana_Tirupati APMC_model.h5`

## 🛠️ Dependencies

- **TensorFlow 2.15.0**: Core ML framework
- **Flask 3.0.0**: Web framework
- **Flask-CORS 4.0.0**: Cross-origin support
- **NumPy 1.24.3**: Numerical computing
- **Python 3.8+**: Required Python version

## 📈 Performance Features

- **Model Caching**: Models loaded once and cached in memory
- **Efficient Processing**: Optimized input feature preparation
- **Batch Processing**: Ready for batch predictions
- **Error Recovery**: Graceful handling of model loading errors

## 🧪 Testing

The service includes comprehensive testing:

- Health check validation
- Model listing verification
- POST/GET prediction testing 
- Error handling validation

## 🔍 Monitoring

Check service status via Node.js backend:
```http
GET /api/predict/ml-status
```

## 🛡️ Error Handling

- **Model Not Found**: Falls back to similar commodity models
- **Invalid Input**: Detailed validation error messages
- **Service Unavailable**: Node.js backend handles fallback gracefully
- **Memory Issues**: Automatic model cleanup and reload

## 📝 Logs

Service logs include:
- Model loading status
- Prediction requests and results  
- Error details and stack traces
- Performance metrics

## 🎯 Production Ready

- **CORS Enabled**: Ready for production deployment
- **Configurable**: Environment variable support
- **Scalable**: Can run multiple instances  
- **Monitored**: Health check and status endpoints