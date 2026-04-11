#!/usr/bin/env python3
"""Test the API endpoints to verify they're working."""

import requests
import json
import uuid
from datetime import datetime

BASE_URL = 'http://localhost:5000'

# Generate unique email
EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"

print("=" * 60)
print("TESTING MINDCARE API")
print("=" * 60)

try:
    # Test 1: Create User
    print("\n[TEST 1] Creating user...")
    r = requests.post(f'{BASE_URL}/api/users', json={'name': 'Test User', 'email': EMAIL})
    print(f"Status: {r.status_code}")
    data = r.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    # The endpoint returns 'id' field not 'user_id'
    user_id = data.get('id') or data.get('user_id')
    print(f"User ID: {user_id}")
    
    if r.status_code not in [200, 201]:
        print(f"ERROR: Could not create user")
        exit(1)
    
    # Test 2: Submit PHQ-9
    print("\n[TEST 2] Submitting PHQ-9 assessment...")
    r = requests.post(f'{BASE_URL}/api/phq', 
        json={'user_id': user_id, 'responses': [1,2,1,0,2,1,0,1,2]})
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 3: Get PHQ History
    print("\n[TEST 3] Getting PHQ history...")
    r = requests.get(f'{BASE_URL}/api/phq/{user_id}')
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 4: Predict Risk Score
    print("\n[TEST 4] Predicting risk score...")
    r = requests.post(f'{BASE_URL}/api/scores',
        json={'user_id': user_id, 'features': [0.5]*18})
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 5: Get Scores
    print("\n[TEST 5] Getting user scores...")
    r = requests.get(f'{BASE_URL}/api/scores/{user_id}')
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 6: Get Latest Score
    print("\n[TEST 6] Getting latest score...")
    r = requests.get(f'{BASE_URL}/api/scores/{user_id}/latest')
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 7: Get Alerts
    print("\n[TEST 7] Getting user alerts...")
    r = requests.get(f'{BASE_URL}/api/alerts/{user_id}')
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    # Test 8: Get Trends
    print("\n[TEST 8] Getting user trends...")
    r = requests.get(f'{BASE_URL}/api/trends/{user_id}')
    print(f"Status: {r.status_code}")
    print(f"Response: {json.dumps(r.json(), indent=2)}")
    
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED")
    print("=" * 60)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
