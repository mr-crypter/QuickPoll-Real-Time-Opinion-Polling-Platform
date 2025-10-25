#!/usr/bin/env python3
"""
Simple test to check if the backend is running and accessible
"""

import requests
import json

def test_backend():
    print("Testing QuickPoll Backend Connection")
    print("=" * 40)
    
    try:
        # Test root endpoint
        print("1. Testing root endpoint...")
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        # Test health endpoint
        print("\n2. Testing health endpoint...")
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        # Test polls endpoint
        print("\n3. Testing polls endpoint...")
        response = requests.get("http://localhost:8000/polls", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            polls = response.json()
            print(f"   Found {len(polls)} polls")
        else:
            print(f"   Error: {response.text}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to backend at http://localhost:8000")
        print("   Make sure the backend is running:")
        print("   cd backend")
        print("   venv\\Scripts\\activate")
        print("   uvicorn main:app --reload")
        return False
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_backend()
    
    if success:
        print("\nSUCCESS: Backend is running and accessible!")
    else:
        print("\nStart the backend with:")
        print("   cd backend")
        print("   venv\\Scripts\\activate") 
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
