const path = require('path');
const fs = require('fs').promises;

// Cache for model metadata and predictions
const modelCache = new Map();
const predictionCache = new Map();

// Check if TensorFlow.js is available
let tf = null;
try {
  tf = require('@tensorflow/tfjs-node');
  console.log('✅ TensorFlow.js Node backend loaded successfully');
} catch (error) {
  console.warn('⚠️ TensorFlow.js Node backend not available, using fallback prediction method');
}

/**
 * Get available models by scanning the models directory
 */
async function getAvailableModels() {
  try {
    const modelsPath = path.join(__dirname, '../../models');
    const frontendModelsPath = path.join(__dirname, '../../frontend/farm2mandi_models');
    
    let modelFiles = [];
    
    // Check if models exist in backend/models directory
    try {
      const backendFiles = await fs.readdir(modelsPath);
      modelFiles = [...modelFiles, ...backendFiles.filter(file => file.endsWith('.h5')).map(file => ({
        path: path.join(modelsPath, file),
        name: file
      }))];
    } catch (err) {
      // Backend models directory doesn't exist, that's okay
    }
    
    // Check frontend models directory
    try {
      const frontendFiles = await fs.readdir(frontendModelsPath);
      modelFiles = [...modelFiles, ...frontendFiles.filter(file => file.endsWith('.h5')).map(file => ({
        path: path.join(frontendModelsPath, file),
        name: file
      }))];
    } catch (err) {
      console.warn('Frontend models directory not found:', frontendModelsPath);
    }

    return modelFiles;
  } catch (error) {
    console.error('Error getting available models:', error);
    return [];
  }
}

/**
 * Parse model filename to extract commodity and market info
 * Example: "Rice_Kurnool APMC_model.h5" -> { commodity: "Rice", market: "Kurnool APMC" }
 */
function parseModelFilename(filename) {
  // Remove .h5 extension and _model suffix
  const cleanName = filename.replace('.h5', '').replace('_model', '');
  
  // Split by underscore to get commodity and market
  const parts = cleanName.split('_');
  
  if (parts.length >= 2) {
    const commodity = parts[0];
    const market = parts.slice(1).join('_');
    
    return {
      commodity: commodity.toLowerCase(),
      market: market.toLowerCase(),
      originalCommodity: commodity,
      originalMarket: market
    };
  }
  
  return null;
}

/**
 * Find the best matching model for a given commodity and market combination
 */
async function findBestModel(commodity, marketName = null) {
  try {
    const availableModels = await getAvailableModels();
    
    if (availableModels.length === 0) {
      throw new Error('No ML models found. Please ensure models are placed in the models directory.');
    }

    const commodityLower = commodity.toLowerCase();
    const marketLower = marketName ? marketName.toLowerCase() : null;

    console.log(`Looking for models matching commodity: "${commodityLower}", market: "${marketLower}"`);

    // Parse all models and find matches
    const parsedModels = availableModels.map(model => ({
      ...model,
      parsed: parseModelFilename(model.name)
    })).filter(model => model.parsed !== null);

    console.log(`Found ${parsedModels.length} parsed models:`, 
      parsedModels.map(m => `${m.parsed.commodity}_${m.parsed.market}`));

    // Find exact match (commodity + market)
    if (marketLower) {
      const exactMatch = parsedModels.find(model => 
        model.parsed.commodity === commodityLower && 
        model.parsed.market.includes(marketLower.replace(' apmc', '').trim())
      );
      
      if (exactMatch) {
        console.log(`Found exact match: ${exactMatch.name}`);
        return exactMatch;
      }
    }

    // Find commodity match (any market)
    const commodityMatch = parsedModels.find(model => 
      model.parsed.commodity === commodityLower
    );

    if (commodityMatch) {
      console.log(`Found commodity match: ${commodityMatch.name}`);
      return commodityMatch;
    }

    // Find partial commodity match
    const partialMatch = parsedModels.find(model => 
      model.parsed.commodity.includes(commodityLower) || 
      commodityLower.includes(model.parsed.commodity)
    );

    if (partialMatch) {
      console.log(`Found partial match: ${partialMatch.name}`);
      return partialMatch;
    }

    throw new Error(`No suitable model found for commodity: ${commodity}, market: ${marketName}`);
  } catch (error) {
    console.error('Error finding best model:', error);
    throw error;
  }
}

/**
 * Load a TensorFlow model from .h5 file (with fallback)
 */
async function loadModel(modelPath) {
  try {
    if (!tf) {
      throw new Error('TensorFlow.js not available - using fallback prediction');
    }

    // Check if model is already cached
    if (modelCache.has(modelPath)) {
      console.log(`Loading cached model: ${modelPath}`);
      return modelCache.get(modelPath);
    }

    console.log(`Loading new model: ${modelPath}`);
    
    // Load model using TensorFlow.js
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    
    // Cache the model
    modelCache.set(modelPath, model);
    
    console.log(`Model loaded successfully: ${modelPath}`);
    return model;
  } catch (error) {
    console.error(`Error loading model from ${modelPath}:`, error);
    throw new Error(`Failed to load model: ${error.message}`);
  }
}

/**
 * Prepare input data for the model (with fallback for non-TensorFlow predictions)
 */
function prepareInputData(date, quantity = 1000) {
  try {
    const targetDate = new Date(date);
    const now = new Date();
    
    // Extract features from date
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const dayOfYear = Math.ceil((targetDate - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    const weekOfYear = Math.ceil(dayOfYear / 7);
    
    // Calculate days from now (could be negative for past dates)
    const daysFromNow = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    
    // Normalize quantity (assuming quantities are typically in hundreds/thousands)
    const normalizedQuantity = quantity / 1000;
    
    // Create feature vector - you may need to adjust this based on your model's training data
    const features = [
      year / 2025, // Normalized year
      month / 12, // Normalized month
      dayOfYear / 365, // Normalized day of year
      weekOfYear / 52, // Normalized week
      daysFromNow / 365, // Normalized days from now
      normalizedQuantity, // Normalized quantity
      Math.sin(2 * Math.PI * month / 12), // Seasonal components
      Math.cos(2 * Math.PI * month / 12),
      Math.sin(2 * Math.PI * dayOfYear / 365),
      Math.cos(2 * Math.PI * dayOfYear / 365)
    ];
    
    if (tf) {
      return tf.tensor2d([features]);
    } else {
      return { features, rawData: { year, month, dayOfYear, weekOfYear, daysFromNow, quantity } };
    }
  } catch (error) {
    console.error('Error preparing input data:', error);
    throw error;
  }
}

/**
 * Create fallback prediction based on commodity and market patterns
 */
function createFallbackPrediction(commodity, marketName, date, quantity) {
  const commodityLower = commodity.toLowerCase();
  const targetDate = new Date(date);
  const month = targetDate.getMonth() + 1;
  
  // Base prices for different commodities (approximate market rates)
  const basePrices = {
    'rice': 2500,
    'banana': 3000,
    'tomato': 4000,
    'cotton': 5500,
    'groundnut': 7000,
    'maize': 2200,
    'mango': 5000,
    'wheat': 2300,
    'turmeric': 8000,
    'chilli': 10000,
    'brinjal': 2500,
    'papaya': 1500,
    'jowar': 2800,
    'arhar': 6000,
    'bajra': 2400
  };
  
  // Find base price
  let basePrice = 2500; // default
  for (const [key, price] of Object.entries(basePrices)) {
    if (commodityLower.includes(key) || key.includes(commodityLower)) {
      basePrice = price;
      break;
    }
  }
  
  // Seasonal adjustment based on month
  const seasonalMultipliers = {
    1: 1.1,  // January - winter season
    2: 1.15, // February - winter peak
    3: 1.05, // March - spring transition
    4: 0.95, // April - harvest season
    5: 0.90, // May - post harvest
    6: 0.85, // June - monsoon prep
    7: 0.90, // July - monsoon
    8: 0.95, // August - monsoon end
    9: 1.00, // September - post monsoon
    10: 1.05, // October - festival season
    11: 1.10, // November - winter prep
    12: 1.15  // December - year end demand
  };
  
  const seasonalPrice = basePrice * (seasonalMultipliers[month] || 1.0);
  
  // Market-specific adjustments
  let marketMultiplier = 1.0;
  if (marketName) {
    const marketLower = marketName.toLowerCase();
    if (marketLower.includes('tirupati') || marketLower.includes('rajahmundry')) {
      marketMultiplier = 1.05; // Premium markets
    } else if (marketLower.includes('kurnool') || marketLower.includes('nandyal')) {
      marketMultiplier = 0.98; // Slightly lower prices
    }
  }
  
  // Quantity adjustment (bulk discount)
  let quantityMultiplier = 1.0;
  if (quantity > 5000) quantityMultiplier = 0.95;
  else if (quantity > 2000) quantityMultiplier = 0.98;
  else if (quantity < 500) quantityMultiplier = 1.02;
  
  const finalPrice = Math.round(seasonalPrice * marketMultiplier * quantityMultiplier * 100) / 100;
  
  return {
    predictedPrice: finalPrice,
    confidence: 0.75, // Good confidence for pattern-based prediction
    method: 'Smart Fallback (Pattern-based)',
    modelUsed: `Fallback for ${commodity}`,
    commodity: commodity,
    market: marketName || 'Generic',
    adjustments: {
      basePrice,
      seasonal: seasonalMultipliers[month],
      market: marketMultiplier,
      quantity: quantityMultiplier
    }
  };
}

/**
 * Make price prediction using ML model with intelligent fallback
 */
async function predictPriceWithML(commodity, date, marketName = null, quantity = 1000) {
  try {
    console.log(`Starting prediction for: ${commodity}, ${marketName}, ${date}, ${quantity}kg`);
    
    if (!tf) {
      console.log('TensorFlow.js not available, using smart fallback prediction');
      return createFallbackPrediction(commodity, marketName, date, quantity);
    }
    
    // Find the best model for this commodity and market
    const selectedModel = await findBestModel(commodity, marketName);
    
    console.log(`Selected model: ${selectedModel.name}`);
    
    // Load the model
    const model = await loadModel(selectedModel.path);
    
    // Prepare input data
    const inputTensor = prepareInputData(date, quantity);
    
    console.log(`Input tensor shape: ${inputTensor.shape}`);
    
    // Make prediction
    const prediction = model.predict(inputTensor);
    const predictionArray = await prediction.data();
    
    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();
    
    const predictedPrice = predictionArray[0];
    
    console.log(`ML Prediction result: ${predictedPrice}`);
    
    // Ensure price is reasonable (basic sanity check)
    const finalPrice = Math.max(100, Math.round(predictedPrice * 100) / 100);
    
    return {
      predictedPrice: finalPrice,
      confidence: 0.85, // High confidence for ML models
      method: 'ML Model',
      modelUsed: selectedModel.name,
      commodity: selectedModel.parsed.originalCommodity,
      market: selectedModel.parsed.originalMarket
    };
    
  } catch (error) {
    console.error('ML Prediction error:', error);
    
    // Fallback to pattern-based prediction
    console.log('Falling back to smart pattern-based prediction');
    return createFallbackPrediction(commodity, marketName, date, quantity);
  }
}

/**
 * Get model information for debugging
 */
async function getModelInfo() {
  try {
    const models = await getAvailableModels();
    const parsed = models.map(model => ({
      filename: model.name,
      path: model.path,
      parsed: parseModelFilename(model.name)
    }));
    
    return {
      totalModels: models.length,
      models: parsed,
      cachedModels: Array.from(modelCache.keys())
    };
  } catch (error) {
    console.error('Error getting model info:', error);
    return { error: error.message };
  }
}

module.exports = {
  predictPriceWithML,
  getAvailableModels,
  findBestModel,
  getModelInfo,
  parseModelFilename
};