"""
Test script for user registration with file uploads.

Usage:
    python test_registration.py

Make sure the backend server is running before executing this script.
"""

import requests
from datetime import date


BASE_URL = "http://localhost:8000"


def create_test_pdf():
    """Create a minimal valid PDF for testing."""
    return b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000317 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n410\n%%EOF"


def create_test_png():
    """Create a minimal valid PNG for testing (1x1 pixel, red)."""
    return (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf'
        b'\xc0\x00\x00\x00\x03\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    )


def test_full_registration():
    """Test user registration with all fields including files."""
    print("\n" + "="*70)
    print("Testing Full User Registration with Files")
    print("="*70)
    
    # Prepare form data
    data = {
        'full_name': 'John Doe',
        'gender': 'Male',
        'date_of_birth': '1995-05-15',
        'phone': '+1234567890',
        'email': f'john.doe.test{date.today().strftime("%Y%m%d%H%M%S")}@example.com',
        'password': 'SecurePassword123!',
        'address': '123 Main Street, New York, NY 10001',
        'education': 'Bachelor of Computer Science',
        'experience_years': 3.5,
        'desired_position': 'Full Stack Developer',
        'preferred_job_type': 'Full-time',
        'portfolio_link': 'https://johndoe.dev',
        'skills': ['Python', 'JavaScript', 'FastAPI'],
    }
    
    # Prepare files
    files = {
        'resume': ('resume.pdf', create_test_pdf(), 'application/pdf'),
        'profile_picture': ('profile.png', create_test_png(), 'image/png'),
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=data,
            files=files
        )
        
        if response.status_code == 200:
            print("✓ Registration successful!")
            result = response.json()
            print(f"\nCreated User:")
            print(f"  ID: {result['id']}")
            print(f"  Name: {result['full_name']}")
            print(f"  Email: {result['email']}")
            print(f"  Resume: {result['resume_url']}")
            print(f"  Profile Picture: {result['profile_picture_url']}")
        else:
            print(f"✗ Registration failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_registration_without_files():
    """Test user registration without resume and profile picture."""
    print("\n" + "="*70)
    print("Testing User Registration without Files")
    print("="*70)
    
    # Prepare form data (no files)
    data = {
        'full_name': 'Jane Smith',
        'gender': 'Female',
        'date_of_birth': '1998-08-20',
        'phone': '+9876543210',
        'email': f'jane.smith.test{date.today().strftime("%Y%m%d%H%M%S")}@example.com',
        'password': 'AnotherPassword456!',
        'address': '456 Oak Avenue, Los Angeles, CA 90001',
        'education': 'Master of Data Science',
        'experience_years': 2.0,
        'desired_position': 'Data Scientist',
        'preferred_job_type': 'Remote',
        'portfolio_link': 'https://janesmith.io',
        'skills': ['Python', 'Machine Learning', 'TensorFlow'],
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=data
        )
        
        if response.status_code == 200:
            print("✓ Registration successful without files!")
            result = response.json()
            print(f"\nCreated User:")
            print(f"  ID: {result['id']}")
            print(f"  Name: {result['full_name']}")
            print(f"  Email: {result['email']}")
            print(f"  Resume: {result['resume_url'] or 'None'}")
            print(f"  Profile Picture: {result['profile_picture_url'] or 'None'}")
        else:
            print(f"✗ Registration failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_registration_invalid_resume():
    """Test registration with invalid resume file type."""
    print("\n" + "="*70)
    print("Testing Registration with Invalid Resume (should fail)")
    print("="*70)
    
    data = {
        'full_name': 'Test User',
        'gender': 'Other',
        'date_of_birth': '1990-01-01',
        'phone': '+1111111111',
        'email': f'test.invalid{date.today().strftime("%Y%m%d%H%M%S")}@example.com',
        'password': 'TestPassword!',
        'address': 'Test Address',
        'skills': ['Testing'],
    }
    
    # Try to upload a text file as resume
    files = {
        'resume': ('resume.txt', b'This is not a PDF', 'text/plain'),
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=data,
            files=files
        )
        
        if response.status_code == 400:
            print("✓ Correctly rejected invalid file type!")
            print(f"Error message: {response.json()}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


def test_registration_invalid_image():
    """Test registration with invalid profile picture file type."""
    print("\n" + "="*70)
    print("Testing Registration with Invalid Profile Picture (should fail)")
    print("="*70)
    
    data = {
        'full_name': 'Another Test User',
        'gender': 'Male',
        'date_of_birth': '1992-06-15',
        'phone': '+2222222222',
        'email': f'test.invalid2{date.today().strftime("%Y%m%d%H%M%S")}@example.com',
        'password': 'TestPassword2!',
        'address': 'Another Test Address',
        'skills': ['Testing'],
    }
    
    # Try to upload a PDF as profile picture
    files = {
        'profile_picture': ('photo.pdf', create_test_pdf(), 'application/pdf'),
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users/register",
            data=data,
            files=files
        )
        
        if response.status_code == 400:
            print("✓ Correctly rejected invalid image type!")
            print(f"Error message: {response.json()}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("User Registration with File Upload Tests")
    print("="*70)
    print("\nNote: Make sure the backend server is running!")
    print("      Skills like 'Python', 'JavaScript', 'FastAPI' should exist in DB.")
    
    test_full_registration()
    test_registration_without_files()
    test_registration_invalid_resume()
    test_registration_invalid_image()
    
    print("\n" + "="*70)
    print("All tests completed!")
    print("="*70 + "\n")
