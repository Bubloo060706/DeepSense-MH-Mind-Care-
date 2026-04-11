"""
Quick test script to verify ML model integration with backend
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"
HEALTH_URL = "http://localhost:5000/health"

def test_backend():
    print("\n" + "="*60)
    print("[TEST] MindCare Backend - ML Model Integration Test")
    print("="*60 + "\n")
    
    # 1. Health Check
    print("[OK] Test 1: Health Check")
    try:
        response = requests.get(HEALTH_URL)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        return False
    
    # 2. Model Info
    print("[OK] Test 2: Get Model Info")
    try:
        response = requests.get(f"{BASE_URL}/model/info")
        print(f"   Status: {response.status_code}")
        info = response.json()
        print(f"   Response: {json.dumps(info, indent=2)}\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # 3. Create a test user using simulation
    print("[OK] Test 3: Simulated User Creation")
    test_user_id = "test-user-ml-001"
    print(f"   User ID: {test_user_id}")
    print(f"   (In real scenario, you would create this via API)\n")
    
    # 4. Test prediction with features
    print("[OK] Test 4: Predict Risk Score (ML Model)")
    # 18 features as expected by the trained CNN-LSTM model
    features = [0.5, 0.3, 6, 23, 2, 0.8, 0.9, 0.4, 0.6, 10, 2, 100, 0.5, 0.7, 0.6, 0.4, 0.8, 0.3]
    
    try:
        payload = {
            "user_id": test_user_id,
            "features": features
        }
        response = requests.post(f"{BASE_URL}/scores", json=payload)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Request: {json.dumps(payload, indent=2)}")
        print(f"   Response: {json.dumps(result, indent=2)}\n")
        
        if response.status_code == 201:
            print("   [SUCCESS] ML model made a prediction!")
        elif response.status_code == 404:
            print("   [WARN] User not found (create user first in real scenario)")
        
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    print("="*60)
    print("[OK] Backend testing complete!")
    print("="*60)

if __name__ == "__main__":
    test_backend()
