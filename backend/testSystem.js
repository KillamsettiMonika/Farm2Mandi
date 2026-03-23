/**
 * Quick test to verify the complete system integration
 */

const axios = require('axios');

// Test configurations
const BACKEND_URL = 'http://localhost:5002/api';
const ML_SERVICE_URL = 'http://127.0.0.1:5001';

async function testCompleteSystem() {
    console.log('🧪 Testing Complete Farm2Mandi System...\n');

    // Test 1: ML Service Health
    console.log('1. Testing Python ML Service...');
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`);
        if (response.status === 200) {
            const data = response.data;
            console.log(`✅ ML Service is healthy!`);
            console.log(`   TensorFlow: ${data.tensorflow_version}`);
            console.log(`   Models: ${data.models_available} available, ${data.models_loaded} loaded`);
        }
    } catch (error) {
        console.log(`❌ ML Service failed: ${error.message}`);
        console.log('   Make sure to start: python app.py');
        return;
    }

    // Test 2: ML Service Models
    console.log('\n2. Testing ML Models...');
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/models`);
        if (response.status === 200) {
            const data = response.data;
            console.log(`✅ Found ${data.total_models} ML models`);
            console.log(`   Sample models: ${data.models.slice(0, 3).map(m => m.commodity).join(', ')}`);
        }
    } catch (error) {
        console.log(`❌ ML Models test failed: ${error.message}`);
    }

    // Test 3: ML Direct Prediction
    console.log('\n3. Testing Direct ML Prediction...');
    try {
        const testData = {
            commodity: 'Rice',
            date: '2026-02-20',
            market_name: 'Kurnool',
            quantity: 1000
        };

        const response = await axios.post(`${ML_SERVICE_URL}/predict`, testData);
        if (response.status === 200 && response.data.success) {
            const result = response.data.data;
            console.log(`✅ ML Prediction successful!`);
            console.log(`   🌾 ${testData.commodity}: ₹${result.predicted_price}/kg`);
            console.log(`   🎯 Model: ${result.model_used}`);
            console.log(`   📊 Confidence: ${Math.round(result.confidence * 100)}%`);
        }
    } catch (error) {
        console.log(`❌ ML Prediction failed: ${error.message}`);
    }

    // Test 4: Backend API Health (if running)
    console.log('\n4. Testing Node.js Backend...');
    try {
        const response = await axios.get(`${BACKEND_URL}/predict/test`);
        if (response.status === 200) {
            console.log(`✅ Backend API is running!`);
        }
    } catch (error) {
        console.log(`⚠️ Backend not running: ${error.message}`);
        console.log('   Start with: npm run dev (in backend folder)');
    }

    // Test recommendations
    console.log('\n5. Testing End-to-End Prediction...');
    const testCases = [
        { commodity: 'Rice', market: 'Kurnool' },
        { commodity: 'Tomato', market: 'Madanapalli' }, 
        { commodity: 'Cotton', market: 'Adoni' },
        { commodity: 'Potato', market: null }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`\n   Testing ${testCase.commodity}${testCase.market ? ` at ${testCase.market}` : ''}...`);
            
            const testData = {
                commodity: testCase.commodity,
                date: '2026-02-20',
                market_name: testCase.market,
                quantity: 1000
            };

            const response = await axios.post(`${ML_SERVICE_URL}/predict`, testData);
            if (response.status === 200 && response.data.success) {
                const result = response.data.data;
                console.log(`   ✅ ₹${result.predicted_price}/kg (${result.method})`);
            }
        } catch (error) {
            console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
        }
    }

    console.log('\n🎉 System test completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Ensure both Python ML service and Node.js backend are running');
    console.log('   2. Start frontend: npm run dev (in frontend folder)');
    console.log('   3. Visit: http://localhost:5173/input');
    console.log('   4. Select any commodity and test the predictions!');
}

// Run the test
testCompleteSystem().catch(console.error);