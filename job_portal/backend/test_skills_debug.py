"""
Debug script to test user registration with skills.

This script helps identify issues with skill insertion.

Usage:
    python test_skills_debug.py

Make sure the backend server is running before executing this script.
"""

import requests
from datetime import date


BASE_URL = "http://localhost:8000"


def test_registration_with_skills():
    """Test user registration with skills and debug the response."""
    print("\n" + "="*70)
    print("Testing User Registration with Skills (Debug Mode)")
    print("="*70)
    
    # Use a unique email
    unique_email = f"test.skills.{date.today().strftime('%Y%m%d%H%M%S')}@example.com"
    
    # Prepare form data with skills
    data = {
        'full_name': 'Skills Test User',
        'gender': 'Male',
        'date_of_birth': '1995-05-15',
        'phone': '+1234567890',
        'email': unique_email,
        'password': 'TestPassword123!',
        'address': '123 Test Street',
        'education': 'Bachelor Degree',
        'experience_years': 2.0,
    }
    
    # Add skills - try different formats
    print("\n📌 Sending skills: Python, JavaScript, FastAPI")
    
    # Format 1: Multiple fields with same name (proper way for FastAPI)
    data_with_skills = data.copy()
    
    # We need to send skills as multiple form fields with the same name
    # This is the proper way to send arrays in multipart/form-data
    
    try:
        # Prepare files dict (even if empty, for multipart/form-data)
        files = []
        
        # Add all form fields
        form_data = []
        for key, value in data.items():
            form_data.append((key, str(value)))
        
        # Add skills as separate fields with same name
        form_data.append(('skills', 'Python'))
        form_data.append(('skills', 'JavaScript'))
        form_data.append(('skills', 'FastAPI'))
        
        print(f"\n📤 Sending registration request for: {unique_email}")
        print(f"   Skills being sent: Python, JavaScript, FastAPI")
        
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
            
            # Now check if skills were inserted in user_skills table
            print(f"\n🔍 Checking user_skills table...")
            print(f"   Run this SQL query to verify:")
            print(f"   SELECT * FROM user_skills WHERE user_id = {user_id};")
            
            # Also check the skills table
            print(f"\n🔍 Check if skills exist in database:")
            print(f"   SELECT * FROM skills WHERE name IN ('Python', 'JavaScript', 'FastAPI');")
            
        else:
            print(f"✗ Registration failed!")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


def check_available_skills():
    """Check what skills are available in the database."""
    print("\n" + "="*70)
    print("Available Skills Check")
    print("="*70)
    print("\n💡 Run this SQL to check available skills:")
    print("   SELECT id, name FROM skills ORDER BY name LIMIT 20;")
    print("\nIf no skills exist, you need to populate the skills table first!")


def test_with_nonexistent_skill():
    """Test with a skill that doesn't exist."""
    print("\n" + "="*70)
    print("Testing with Non-existent Skill")
    print("="*70)
    
    unique_email = f"test.badskill.{date.today().strftime('%Y%m%d%H%M%S')}@example.com"
    
    form_data = [
        ('full_name', 'Bad Skill Test'),
        ('gender', 'Female'),
        ('date_of_birth', '1990-01-01'),
        ('phone', '+9999999999'),
        ('email', unique_email),
        ('password', 'TestPass123!'),
        ('address', 'Test Address'),
        ('skills', 'NonExistentSkill123'),  # This skill doesn't exist
        ('skills', 'Python'),  # This one should work
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=form_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Registration successful despite non-existent skill")
            print(f"   User ID: {result['id']}")
            print(f"   This is expected behavior - only existing skills are added")
        else:
            print(f"✗ Registration failed: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Skills Registration Debug Tool")
    print("="*70)
    print("\n⚠️  PREREQUISITES:")
    print("   1. Backend server must be running")
    print("   2. Database must be accessible")
    print("   3. Skills table must be populated with at least: Python, JavaScript, FastAPI")
    
    check_available_skills()
    test_registration_with_skills()
    test_with_nonexistent_skill()
    
    print("\n" + "="*70)
    print("Debug tests completed!")
    print("="*70)
    print("\n📋 Next Steps:")
    print("   1. Check the SQL queries printed above")
    print("   2. Verify skills exist in the skills table")
    print("   3. Verify user_skills entries were created")
    print("   4. If user_skills is empty, check application logs for errors")
    print("\n")
