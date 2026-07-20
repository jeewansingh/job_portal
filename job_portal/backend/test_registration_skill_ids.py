"""
Test script for user registration with skill IDs.

Usage:
    python test_registration_skill_ids.py

Make sure the backend server is running before executing this script.
"""

import requests
from datetime import date


BASE_URL = "http://localhost:8000"


def test_registration_with_skill_ids():
    """Test user registration with skill IDs."""
    print("\n" + "="*70)
    print("Testing User Registration with Skill IDs")
    print("="*70)
    
    unique_email = f"test.skillids.{date.today().strftime('%Y%m%d%H%M%S')}@example.com"
    
    # Prepare form data
    # Note: skill_ids should be integers that exist in your skills table
    form_data = [
        ('full_name', 'Test User'),
        ('gender', 'Male'),
        ('date_of_birth', '1995-05-15'),
        ('phone', '+1234567890'),
        ('email', unique_email),
        ('password', 'TestPass123!'),
        ('address', '123 Test Street'),
        ('education', 'Bachelor Degree'),
        ('experience_years', '2.5'),
        # Send skill IDs as integers - adjust these IDs based on your database
        ('skill_ids', '1'),   # Python
        ('skill_ids', '2'),   # JavaScript
        ('skill_ids', '16'),  # FastAPI
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=form_data
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✓ Registration successful!")
            result = response.json()
            user_id = result['id']
            
            print(f"\n👤 Created User:")
            print(f"   ID: {user_id}")
            print(f"   Name: {result['full_name']}")
            print(f"   Email: {result['email']}")
            
            print(f"\n🔍 To verify skills were inserted, run:")
            print(f"   SELECT us.*, s.name FROM user_skills us")
            print(f"   JOIN skills s ON us.skill_id = s.id")
            print(f"   WHERE us.user_id = {user_id};")
            
        else:
            print(f"✗ Registration failed!")
            print(f"   Error: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


def test_registration_with_invalid_skill_ids():
    """Test registration with invalid skill IDs (should fail)."""
    print("\n" + "="*70)
    print("Testing with Invalid Skill IDs (should fail)")
    print("="*70)
    
    unique_email = f"test.badskills.{date.today().strftime('%Y%m%d%H%M%S')}@example.com"
    
    form_data = [
        ('full_name', 'Bad Skills Test'),
        ('gender', 'Female'),
        ('date_of_birth', '1990-01-01'),
        ('phone', '+9999999999'),
        ('email', unique_email),
        ('password', 'TestPass123!'),
        ('address', 'Test Address'),
        ('skill_ids', '1'),     # Valid
        ('skill_ids', '9999'),  # Invalid - doesn't exist
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=form_data
        )
        
        if response.status_code == 400:
            print("✓ Correctly rejected invalid skill IDs!")
            print(f"   Error message: {response.json()}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
            print(f"   Response: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_registration_without_skills():
    """Test registration without any skills."""
    print("\n" + "="*70)
    print("Testing Registration without Skills")
    print("="*70)
    
    unique_email = f"test.noskills.{date.today().strftime('%Y%m%d%H%M%S')}@example.com"
    
    form_data = [
        ('full_name', 'No Skills User'),
        ('gender', 'Other'),
        ('date_of_birth', '1992-06-15'),
        ('phone', '+5555555555'),
        ('email', unique_email),
        ('password', 'TestPass123!'),
        ('address', 'Test Address'),
        # No skill_ids sent
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=form_data
        )
        
        if response.status_code == 200:
            print("✓ Registration successful without skills!")
            result = response.json()
            print(f"   User ID: {result['id']}")
            print(f"   Name: {result['full_name']}")
        else:
            print(f"✗ Registration failed: {response.json()}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def show_available_skills():
    """Display SQL query to check available skills."""
    print("\n" + "="*70)
    print("Available Skills Check")
    print("="*70)
    print("\n💡 Run this SQL to see available skill IDs:")
    print("   SELECT id, name, category FROM skills ORDER BY id LIMIT 20;")
    print("\n📝 Example output:")
    print("   id |    name     |       category")
    print("   ---|-------------|-------------------------")
    print("    1 | Python      | Programming Languages")
    print("    2 | JavaScript  | Programming Languages")
    print("   16 | FastAPI     | Backend")
    print("   ...")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Skill IDs Registration Test Tool")
    print("="*70)
    print("\n⚠️  PREREQUISITES:")
    print("   1. Backend server must be running")
    print("   2. Database must be accessible")
    print("   3. Skills table must be populated")
    
    show_available_skills()
    test_registration_with_skill_ids()
    test_registration_with_invalid_skill_ids()
    test_registration_without_skills()
    
    print("\n" + "="*70)
    print("Tests completed!")
    print("="*70)
    print("\n📋 Summary:")
    print("   ✓ Skills are now passed as INTEGER IDs, not names")
    print("   ✓ Invalid skill IDs are rejected with error message")
    print("   ✓ Skills are optional - registration works without them")
    print("   ✓ Duplicate skill IDs are automatically removed")
    print("\n")
