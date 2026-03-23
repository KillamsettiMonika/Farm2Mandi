const Price = require('../models/Price');
const { predictPriceWithML } = require('./pythonMLService');

/**
 * Predict price for a commodity using Python ML Service with historical data fallback
 * Primary: Python ML service with TensorFlow models
 * Fallback: Historical average of recent modal prices
 */
async function predictPrice(commodity, date, marketName = null, quantity = 1000) {
  try {
    console.log(`Predicting price for ${commodity} at ${marketName || 'any market'} on ${date}`);
    
    // First try Python ML service
    try {
      const mlResult = await predictPriceWithML(commodity, date, marketName, quantity);
      console.log('Successfully used Python ML service for prediction:', mlResult);
      return mlResult;
    } catch (mlError) {
      console.warn('Python ML service failed, falling back to historical data:', mlError.message);
      
      // Fallback to historical data method
      return await predictPriceHistorical(commodity, date);
    }
  } catch (error) {
    console.error('Error in predictPrice:', error);
    return { 
      predictedPrice: 2000, 
      confidence: 0, 
      method: 'Default',
      error: error.message 
    };
  }
}

/**
 * Historical prediction method (fallback when ML models are not available)
 */
async function predictPriceHistorical(commodity, date) {
  try {
    const queryDate = new Date(date);
    const thirtyDaysAgo = new Date(queryDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent prices for this commodity
    const recentPrices = await Price.find({
      commodity: { $regex: new RegExp(commodity, 'i') }, // Case-insensitive
      priceDate: { $gte: thirtyDaysAgo, $lte: queryDate }
    }).sort({ priceDate: -1 }).limit(100);

    if (recentPrices.length === 0) {
      // If no historical data, return a default price
      return { 
        predictedPrice: 2000, 
        confidence: 0,
        method: 'Default (No Data)',
        message: 'No historical data available'
      };
    }

    // Calculate average of modal prices
    const total = recentPrices.reduce((sum, price) => sum + price.modalPrice, 0);
    const average = total / recentPrices.length;

    // Simple trend calculation (comparing last 10 vs previous 10)
    const recent = recentPrices.slice(0, 10);
    const older = recentPrices.slice(10, 20);
    
    let trend = 0;
    if (older.length > 0 && recent.length > 0) {
      const recentAvg = recent.reduce((sum, p) => sum + p.modalPrice, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.modalPrice, 0) / older.length;
      trend = (recentAvg - olderAvg) / olderAvg; // Percentage change
    }

    // Apply trend to prediction
    const predictedPrice = average * (1 + trend * 0.5); // Apply 50% of trend

    return {
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.min(1, recentPrices.length / 50), // Confidence based on data points
      historicalAverage: Math.round(average * 100) / 100,
      method: 'Historical Average',
      dataPoints: recentPrices.length,
      trend: Math.round(trend * 10000) / 100 // Percentage
    };
  } catch (error) {
    console.error('Error in historical prediction:', error);
    return { 
      predictedPrice: 2000, 
      confidence: 0,
      method: 'Default (Error)',
      error: error.message 
    };
  }
}

module.exports = { predictPrice, predictPriceHistorical };
