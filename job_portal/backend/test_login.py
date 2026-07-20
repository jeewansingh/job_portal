"""
Test script for user login functionality.

Usage:
    python test_login.py

Make sure the backend server is running before executing this script.
"""

import requests
import json


BASE_URL = "http://localhost:8000"


def test_successful_login():
    """Test login with valid credentials."""
    print("\n" + "="*70)
    print("Test 1: Successful Login")
    print("="*70)
    
    # Update these credentials with a real user from your database
    login_data = {
        "email": "jeewan@gmail.com",  # Change to existing user
        "password": "your-password"    # Change to actual password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✓ Login successful!")
            data = response.json()
            
            print(f"\n📋 Response:")
            print(json.dumps(data, indent=2))
            
            print(f"\n🔑 Access Token: {data['access_token'][:50]}...")
            print(f"👤 User: {data['user']['full_name']} ({data['user']['email']})")
            
        else:
            print(f"✗ Login failed!")
            print(f"Response: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_invalid_email():
    """Test login with non-existent email."""
    print("\n" + "="*70)
    print("Test 2: Invalid Email")
    print("="*70)
    
    login_data = {
        "email": "nonexistent@example.com",
        "password": "anypassword"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✓ Correctly rejected invalid email!")
            print(f"Message: {response.json()['detail']}")
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            print(f"Response: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_invalid_password():
    """Test login with wrong password."""
    print("\n" + "="*70)
    print("Test 3: Invalid Password")
    print("="*70)
    
    login_data = {
        "email": "jeewan@gmail.com",  # Change to existing user
        "password": "wrongpassword123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✓ Correctly rejected invalid password!")
            print(f"Message: {response.json()['detail']}")
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            print(f"Response: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_missing_fields():
    """Test login with missing fields."""
    print("\n" + "="*70)
    print("Test 4: Missing Fields")
    print("="*70)
    
    login_data = {
        "email": "test@example.com"
        # Missing password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print("✓ Correctly rejected request with missing password!")
            print(f"Validation errors: {response.json()}")
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_invalid_email_format():
    """Test login with invalid email format."""
    print("\n" + "="*70)
    print("Test 5: Invalid Email Format")
    print("="*70)
    
    login_data = {
        "email": "not-an-email",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print("✓ Correctly rejected invalid email format!")
            print(f"Validation errors: {response.json()}")
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def show_curl_examples():
    """Display cURL examples for manual testing."""
    print("\n" + "="*70)
    print("cURL Examples")
    print("="*70)
    
    print("\n1. Successful login:")
    print("""
curl -X POST "http://localhost:8000/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "jeewan@gmail.com",
    "password": "your-password"
  }'
""")
    
    print("\n2. Invalid credentials:")
    print("""
curl -X POST "http://localhost:8000/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }'
""")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Login API Test Suite")
    print("="*70)
    print("\n⚠️  PREREQUISITES:")
    print("   1. Backend server must be running")
    print("   2. Database must be accessible")
    print("   3. At least one user must exist in the database")
    print("   4. Update email/password in test_successful_login()")
    
    test_successful_login()
    test_invalid_email()
    test_invalid_password()
    test_missing_fields()
    test_invalid_email_format()
    show_curl_examples()
    
    print("\n" + "="*70)
    print("Tests completed!")
    print("="*70 + "\n")
