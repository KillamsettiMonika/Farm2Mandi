const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const Mandi = require('../models/Mandi');
const Price = require('../models/Price');
const { calculateDistance } = require('../utils/distance');
const { predictPrice } = require('../utils/prediction');
const { getModelInfo, checkMLService } = require('../utils/pythonMLService');

// Test route to verify the router is working (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Predict routes are working!', timestamp: new Date().toISOString() });
});

// Python ML service status endpoint
router.get('/ml-status', async (req, res) => {
  try {
    const isAvailable = await checkMLService();
    const modelInfo = await getModelInfo();
    
    res.json({
      python_ml_service: isAvailable ? 'Available' : 'Unavailable',
      ...modelInfo
    });
  } catch (error) {
    console.error('Error checking ML service status:', error);
    res.status(500).json({ error: 'Failed to check ML service status', message: error.message });
  }
});

// Debug endpoint to check available ML models (no auth required for testing)
router.get('/models', async (req, res) => {
  try {
    const modelInfo = await getModelInfo();
    res.json(modelInfo);
  } catch (error) {
    console.error('Error getting model info:', error);
    res.status(500).json({ error: 'Failed to get model information', message: error.message });
  }
});

// ML prediction test endpoint (no auth required for testing)
router.get('/test-ml', async (req, res) => {
  try {
    const { commodity = 'Rice', date = '2026-02-15', market = 'Kurnool', quantity = 1000 } = req.query;
    
    const { predictPriceWithML } = require('../utils/pythonMLService');
    const result = await predictPriceWithML(commodity, date, market, parseFloat(quantity));
    
    res.json({
      success: true,
      input: { commodity, date, market, quantity },
      result
    });
  } catch (error) {
    console.error('ML test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      input: req.query
    });
  }
});

/**
 * GET /api/predict
 * Clean API: GET /predict?commodity=Wheat&date=2025-11-06&lat=28.7041&lng=77.1025&quantity=1000
 */
router.get('/predict', requireAuth, async (req, res) => {
  try {
    const { commodity, date, lat, lng, quantity = 1000 } = req.query;

    // Validation
    if (!commodity) return res.status(400).json({ error: 'commodity required' });
    if (!date) return res.status(400).json({ error: 'date required (format: YYYY-MM-DD)' });
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const farmerLat = parseFloat(lat);
    const farmerLng = parseFloat(lng);
    const qty = parseFloat(quantity) || 1000;

    if (isNaN(farmerLat) || isNaN(farmerLng)) {
      return res.status(400).json({ error: 'Invalid lat/lng coordinates' });
    }

    console.log(`Prediction request: ${commodity}, ${date}, ${farmerLat}, ${farmerLng}, ${qty}kg`);

    // 1. Get predicted price using ML models (no specific market initially)
    const pricePrediction = await predictPrice(commodity, date, null, qty);
    const predictedPrice = pricePrediction.predictedPrice;

    console.log(`Base prediction result:`, pricePrediction);

    // 2. Get all mandis for that commodity in Andhra Pradesh only
    const mandis = await Mandi.find({
      state: { $regex: /^Andhra Pradesh$/i },
      $or: [
        { commodity: { $regex: new RegExp(commodity, 'i') } },
        { commodities: { $regex: new RegExp(commodity, 'i') } }
      ]
    });

    if (mandis.length === 0) {
      return res.json({
        commodity,
        predictedPrice,
        quantity: qty,
        predictionInfo: pricePrediction,
        mandis: [],
        message: 'No mandis found for this commodity'
      });
    }

    // 3-6. Calculate distance, transport cost, and profit for each mandi
    const mandiRecommendations = await Promise.all(
      mandis.map(async (mandi) => {
        try {
          // 3. Calculate distance using Haversine formula
          const distanceKm = calculateDistance(
            farmerLat,
            farmerLng,
            mandi.latitude,
            mandi.longitude
          );

          // 4. Calculate transport cost (distance_km * 10)
          const transportCost = distanceKm * 10;

          // Get mandi-specific ML prediction
          let mandiPredictedPrice = predictedPrice;
          let predictionMethod = 'Base prediction';
          
          try {
            const mandiPrediction = await predictPrice(commodity, date, mandi.name, qty);
            mandiPredictedPrice = mandiPrediction.predictedPrice;
            predictionMethod = mandiPrediction.method || 'ML Model';
            
            console.log(`Mandi-specific prediction for ${mandi.name}:`, mandiPrediction);
          } catch (mandiErr) {
            console.warn(`Failed to get mandi-specific prediction for ${mandi.name}, using base:`, mandiErr.message);
            
            // Fallback: Get latest price for this mandi and commodity
            const latestPrice = await Price.findOne({
              marketName: { $regex: new RegExp(mandi.name, 'i') },
              commodity: { $regex: new RegExp(commodity, 'i') }
            }).sort({ priceDate: -1 });

            if (latestPrice) {
              mandiPredictedPrice = latestPrice.modalPrice;
              predictionMethod = 'Historical price';
            }
          }

          // 5. Calculate profit: profit = (predictedPrice * quantity) - transportCost
          const revenue = mandiPredictedPrice * qty;
          const profit = revenue - transportCost;

          return {
            name: mandi.name,
            state: mandi.state,
            district: mandi.district,
            latitude: mandi.latitude,
            longitude: mandi.longitude,
            distance_km: Math.round(distanceKm * 100) / 100,
            predicted_price: Math.round(mandiPredictedPrice * 100) / 100,
            prediction_method: predictionMethod,
            transport_cost: Math.round(transportCost * 100) / 100,
            estimated_profit: Math.round(profit * 100) / 100,
            revenue: Math.round(revenue * 100) / 100
          };
        } catch (mandiError) {
          console.error(`Error processing mandi ${mandi.name}:`, mandiError);
          
          // Return basic calculation on error
          const distanceKm = calculateDistance(
            farmerLat,
            farmerLng,
            mandi.latitude,
            mandi.longitude
          );
          const transportCost = distanceKm * 10;
          const revenue = predictedPrice * qty;
          const profit = revenue - transportCost;

          return {
            name: mandi.name,
            state: mandi.state,
            district: mandi.district,
            latitude: mandi.latitude,
            longitude: mandi.longitude,
            distance_km: Math.round(distanceKm * 100) / 100,
            predicted_price: Math.round(predictedPrice * 100) / 100,
            prediction_method: 'Fallback',
            transport_cost: Math.round(transportCost * 100) / 100,
            estimated_profit: Math.round(profit * 100) / 100,
            revenue: Math.round(revenue * 100) / 100,
            error: mandiError.message
          };
        }
      })
    );

    // 7. Sort by profit (descending)
    mandiRecommendations.sort((a, b) => b.estimated_profit - a.estimated_profit);

    // 8. Return top 3 mandis
    const topMandis = mandiRecommendations.slice(0, 3);

    res.json({
      commodity,
      predictedPrice,
      quantity: qty,
      predictionInfo: {
        method: pricePrediction.method,
        confidence: pricePrediction.confidence,
        modelUsed: pricePrediction.modelUsed,
        trend: pricePrediction.trend
      },
      farmerLocation: { lat: farmerLat, lng: farmerLng },
      mandis: topMandis,
      allMandisCount: mandis.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /predict:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/predict (Backward compatibility)
 * Supports both old format and new format with lat/lng
 */
router.post('/predict', requireAuth, async (req, res) => {
  try {
    const { crop, commodity, date, location, lat, lng, quantity = 1000 } = req.body;
    
    // Support both 'crop' and 'commodity' field names
    const commodityName = commodity || crop;
    if (!commodityName) return res.status(400).json({ error: 'commodity/crop required' });

    // If lat/lng provided, use GET logic
    if (lat && lng) {
      const farmerLat = parseFloat(lat);
      const farmerLng = parseFloat(lng);
      
      if (!isNaN(farmerLat) && !isNaN(farmerLng)) {
        // Reuse GET endpoint logic
        const pricePrediction = await predictPrice(commodityName, date || new Date().toISOString().split('T')[0], null, qty);
        const predictedPrice = pricePrediction.predictedPrice;

        const mandis = await Mandi.find({
          state: { $regex: /^Andhra Pradesh$/i },
          $or: [
            { commodity: { $regex: new RegExp(commodityName, 'i') } },
            { commodities: { $regex: new RegExp(commodityName, 'i') } }
          ]
        });

        const qty = parseFloat(quantity) || 1000;
        const mandiRecommendations = await Promise.all(
          mandis.map(async (mandi) => {
            const distanceKm = calculateDistance(farmerLat, farmerLng, mandi.latitude, mandi.longitude);
            const transportCost = distanceKm * 10;
            const latestPrice = await Price.findOne({
              marketName: { $regex: new RegExp(mandi.name, 'i') },
              commodity: { $regex: new RegExp(commodityName, 'i') }
            }).sort({ priceDate: -1 });
            const mandiPredictedPrice = latestPrice ? latestPrice.modalPrice : predictedPrice;
            const revenue = mandiPredictedPrice * qty;
            const profit = revenue - transportCost;

            return {
              name: mandi.name,
              state: mandi.state,
              district: mandi.district,
              distance_km: Math.round(distanceKm * 100) / 100,
              predicted_price: Math.round(mandiPredictedPrice * 100) / 100,
              transport_cost: Math.round(transportCost * 100) / 100,
              estimated_profit: Math.round(profit * 100) / 100
            };
          })
        );

        mandiRecommendations.sort((a, b) => b.estimated_profit - a.estimated_profit);
        const topMandis = mandiRecommendations.slice(0, 3);

        return res.json({ 
          crop: commodityName, 
          commodity: commodityName,
          predictedPrice, 
          mandis: topMandis 
        });
      }
    }

    // Fallback to simple stub for backward compatibility
    const pricePrediction = await predictPrice(commodityName, date || new Date().toISOString().split('T')[0]);
    const predictedPrice = pricePrediction.predictedPrice;

    res.json({ 
      crop: commodityName,
      commodity: commodityName,
      predictedPrice,
      mandis: [],
      message: 'Please provide lat/lng coordinates for mandi recommendations'
    });
  } catch (error) {
    console.error('Error in POST /predict:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/transport-options
router.post('/transport-options', requireAuth, (req, res) => {
  const { from, to, quantity } = req.body;
  // Normally integrate third-party logistics API here. Return stubbed trucks.
  const trucks = [
    { provider: 'TruckCo', capacity: 1000, available: true, price: 4000, eta_minutes: 45 },
    { provider: 'AgriLog', capacity: 3000, available: true, price: 8000, eta_minutes: 120 }
  ];
  res.json({ from, to, quantity, trucks });
});

// GET /api/track/:vehicleId - stub
router.get('/track/:vehicleId', requireAuth, (req, res) => {
  const { vehicleId } = req.params;
  // Stubbed location updates
  const timeline = [
    { lat: 28.7041, lon: 77.1025, timestamp: Date.now() - 1000 * 60 * 60 },
    { lat: 28.7300, lon: 77.1200, timestamp: Date.now() - 1000 * 60 * 30 },
    { lat: 28.7450, lon: 77.1400, timestamp: Date.now() }
  ];
  res.json({ vehicleId, timeline });
});

/**
 * GET /api/districts
 * Get all districts in Andhra Pradesh (no auth required for browsing)
 */
router.get('/districts', async (req, res) => {
  try {
    const districts = await Mandi.distinct('district', {
      state: { $regex: /^Andhra Pradesh$/i }
    });
    const sortedDistricts = districts.filter(d => d && d.trim()).sort();
    res.json({ 
      state: 'Andhra Pradesh',
      districts: sortedDistricts,
      count: sortedDistricts.length
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/markets
 * Get all markets in Andhra Pradesh, optionally filtered by district
 * Query params: ?district=DistrictName (optional)
 */
router.get('/markets', async (req, res) => {
  try {
    const { district } = req.query;
    
    const query = {
      state: { $regex: /^Andhra Pradesh$/i }
    };
    
    if (district && district.trim()) {
      query.district = { $regex: new RegExp(district.trim(), 'i') };
    }
    
    const markets = await Mandi.find(query)
      .select('name district state latitude longitude commodities')
      .sort({ district: 1, name: 1 });
    
    // Group by district for better organization
    const marketsByDistrict = {};
    markets.forEach(market => {
      const dist = market.district || 'Unknown';
      if (!marketsByDistrict[dist]) {
        marketsByDistrict[dist] = [];
      }
      marketsByDistrict[dist].push({
        name: market.name,
        district: market.district,
        state: market.state,
        latitude: market.latitude,
        longitude: market.longitude,
        commodities: market.commodities || [market.commodity].filter(Boolean)
      });
    });
    
    res.json({
      state: 'Andhra Pradesh',
      district: district || 'All',
      markets: markets,
      marketsByDistrict: marketsByDistrict,
      count: markets.length
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/markets/:marketName
 * Get details of a specific market by name
 */
router.get('/markets/:marketName', async (req, res) => {
  try {
    const { marketName } = req.params;
    
    const market = await Mandi.findOne({
      state: { $regex: /^Andhra Pradesh$/i },
      name: { $regex: new RegExp(marketName.trim(), 'i') }
    });
    
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    
    // Get latest prices for this market
    const latestPrices = await Price.find({
      marketName: { $regex: new RegExp(market.name, 'i') },
      state: { $regex: /^Andhra Pradesh$/i }
    })
      .sort({ priceDate: -1 })
      .limit(10)
      .select('commodity modalPrice priceDate')
      .lean();
    
    res.json({
      market: {
        name: market.name,
        district: market.district,
        state: market.state,
        latitude: market.latitude,
        longitude: market.longitude,
        commodities: market.commodities || [market.commodity].filter(Boolean)
      },
      latestPrices: latestPrices
    });
  } catch (error) {
    console.error('Error fetching market details:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
