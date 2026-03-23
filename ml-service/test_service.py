#!/usr/bin/env python3
"""
Test script for Farm2Mandi ML Service
"""

import requests
import json
import time

def test_ml_service():
    base_url = "http://127.0.0.1:5001"
    
    print("🧪 Testing Farm2Mandi ML Service...")
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Service is healthy!")
            print(f"   TensorFlow version: {health_data['tensorflow_version']}")
            print(f"   Models available: {health_data['models_available']}")
            print(f"   Models loaded: {health_data['models_loaded']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Test 2: List models
    print("\n2. Testing models endpoint...")
    try:
        response = requests.get(f"{base_url}/models")
        if response.status_code == 200:
            models_data = response.json()
            print(f"✅ Found {models_data['total_models']} models")
            for model in models_data['models'][:5]:  # Show first 5
                print(f"   - {model['commodity']} at {model['market']}")
        else:
            print(f"❌ Models endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Models endpoint error: {e}")
    
    # Test 3: POST prediction
    print("\n3. Testing POST prediction...")
    test_cases = [
        {'commodity': 'Rice', 'date': '2026-02-15', 'market_name': 'Kurnool', 'quantity': 1000},
        {'commodity': 'Banana', 'date': '2026-02-20', 'market_name': 'Tirupati', 'quantity': 500},
        {'commodity': 'Tomato', 'date': '2026-03-01', 'market_name': 'Madanapalli', 'quantity': 2000}
    ]
    
    for test_case in test_cases:
        try:
            response = requests.post(f"{base_url}/predict", json=test_case)
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    data = result['data']
                    print(f"✅ {test_case['commodity']} at {test_case['market_name']}: ₹{data['predicted_price']}/kg")
                    print(f"   Model: {data['model_used']}")
                    print(f"   Confidence: {data['confidence']}")
                else:
                    print(f"❌ Prediction failed: {result['error']}")
            else:
                print(f"❌ POST prediction failed: {response.status_code}")
        except Exception as e:
            print(f"❌ POST prediction error: {e}")
    
    # Test 4: GET prediction
    print("\n4. Testing GET prediction...")
    try:
        response = requests.get(f"{base_url}/predict/Rice?date=2026-02-15&market=Kurnool&quantity=1000")
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                data = result['data']
                print(f"✅ GET prediction: ₹{data['predicted_price']}/kg")
            else:
                print(f"❌ GET prediction failed: {result['error']}")
        else:
            print(f"❌ GET prediction failed: {response.status_code}")
    except Exception as e:
        print(f"❌ GET prediction error: {e}")
    
    print("\n🎉 ML Service testing completed!")

if __name__ == "__main__":
    print("Make sure the ML service is running on port 5001")
    print("Run: python app.py")
    print()
    
    # Wait a moment for user to start service
    try:
        test_ml_service()
    except KeyboardInterrupt:
        print("\nTest interrupted by user")