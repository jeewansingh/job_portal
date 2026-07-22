"""
Test script to verify resume upload endpoint is working
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_resume_endpoint():
    """Test if the resume endpoint is accessible"""
    
    print("Testing Resume Upload Endpoint\n")
    print("="*60)
    
    # Test 1: Check if endpoint exists
    print("\n1. Checking if POST /resume/upload endpoint exists...")
    
    try:
        # Try to call endpoint without file (should give validation error, not 405)
        response = requests.post(f"{API_BASE_URL}/resume/upload")
        
        if response.status_code == 405:
            print("   ❌ ERROR: Method Not Allowed (405)")
            print("   This means the endpoint doesn't exist or router not registered")
        elif response.status_code == 422:
            print("   ✓ Endpoint exists (got validation error as expected)")
        else:
            print(f"   Got status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ ERROR: Cannot connect to backend")
        print("   Make sure backend is running: uvicorn app.main:app --reload")
        return
    
    # Test 2: Check available routes
    print("\n2. Checking all available routes...")
    try:
        response = requests.get(f"{API_BASE_URL}/docs")
        if response.status_code == 200:
            print("   ✓ FastAPI docs available at /docs")
            print("   Check http://localhost:8000/docs for all endpoints")
    except:
        pass
    
    # Test 3: Try with dummy data
    print("\n3. Testing with dummy file...")
    
    # Create a simple text file pretending to be PDF (just for testing endpoint)
    files = {'file': ('test.pdf', b'dummy content', 'application/pdf')}
    
    try:
        response = requests.post(f"{API_BASE_URL}/resume/upload", files=files)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 405:
            print("   ❌ ERROR: Method Not Allowed")
            print("   Router may not be registered properly")
        elif response.status_code == 200:
            print("   ✓ Endpoint is working!")
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_resume_endpoint()
    
    print("\n\nNext Steps:")
    print("1. Visit http://localhost:8000/docs")
    print("2. Find 'POST /resume/upload' in the list")
    print("3. Click 'Try it out' and test with a real PDF")
    print("\nIf endpoint is missing, check:")
    print("- Is backend running?")
    print("- Is resume_router included in app.include_router()?")
    print("- Any import errors in resume.py?")
