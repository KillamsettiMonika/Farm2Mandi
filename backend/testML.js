// Test script to verify ML model integration
const path = require('path');
const { predictPriceWithML, getAvailableModels, getModelInfo } = require('./utils/mlPrediction');

async function testMLIntegration() {
  console.log('🧪 Testing ML Model Integration...\n');
  
  try {
    // 1. Check available models
    console.log('1. Checking available models...');
    const modelInfo = await getModelInfo();
    console.log(`Found ${modelInfo.totalModels} models:`);
    modelInfo.models.forEach(model => {
      if (model.parsed) {
        console.log(`  - ${model.filename} → Commodity: ${model.parsed.commodity}, Market: ${model.parsed.market}`);
      } else {
        console.log(`  - ${model.filename} → Could not parse`);
      }
    });
    console.log('');

    if (modelInfo.totalModels === 0) {
      console.log('❌ No models found! Please ensure .h5 files are in the frontend/farm2mandi_models directory.');
      return;
    }

    // 2. Test predictions with different commodities
    const testCases = [
      { commodity: 'Rice', date: '2026-02-15', market: 'Kurnool', quantity: 1000 },
      { commodity: 'Banana', date: '2026-02-20', market: 'Tirupati', quantity: 500 },
      { commodity: 'Tomato', date: '2026-03-01', market: 'Madanapalli', quantity: 2000 },
      { commodity: 'Wheat', date: '2026-02-18', market: null, quantity: 1500 }
    ];

    console.log('2. Testing predictions...\n');

    for (const testCase of testCases) {
      try {
        console.log(`Testing: ${testCase.commodity} at ${testCase.market || 'any market'} on ${testCase.date}`);
        
        const result = await predictPriceWithML(
          testCase.commodity, 
          testCase.date, 
          testCase.market, 
          testCase.quantity
        );
        
        console.log(`✅ Success: ₹${result.predictedPrice}/kg (Model: ${result.modelUsed})`);
        console.log(`   Method: ${result.method}, Confidence: ${result.confidence}\n`);
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
      }
    }

    console.log('🎉 ML integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testMLIntegration().catch(console.error);
}

module.exports = { testMLIntegration };