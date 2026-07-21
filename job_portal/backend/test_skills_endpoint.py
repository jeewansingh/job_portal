"""
Test script to verify the skills endpoint is working.

Usage:
    python test_skills_endpoint.py

Make sure the backend server is running before executing this script.
"""

import requests
import json


BASE_URL = "http://localhost:8000"


def test_skills_endpoint():
    """Test the GET /skills endpoint."""
    print("\n" + "="*70)
    print("Testing GET /skills endpoint")
    print("="*70)
    
    try:
        response = requests.get(f"{BASE_URL}/skills")
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            skills = response.json()
            print(f"✓ Skills endpoint working!")
            print(f"✓ Total skills: {len(skills)}")
            
            if len(skills) > 0:
                print(f"\n📋 First 5 skills:")
                for skill in skills[:5]:
                    print(f"   ID: {skill['id']:<3} | Name: {skill['name']:<20} | Category: {skill.get('category', 'N/A')}")
            else:
                print("\n⚠️  Warning: Skills table is empty!")
                print("   Run: psql -U postgres -d job_portal -f backend/populate_skills.sql")
                
        else:
            print(f"✗ Skills endpoint failed!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Error: {e}")


def test_cors():
    """Test CORS configuration."""
    print("\n" + "="*70)
    print("Testing CORS Configuration")
    print("="*70)
    
    try:
        response = requests.get(
            f"{BASE_URL}/skills",
            headers={"Origin": "http://localhost:5173"}
        )
        
        cors_header = response.headers.get("Access-Control-Allow-Origin")
        
        if cors_header:
            print(f"✓ CORS configured!")
            print(f"   Access-Control-Allow-Origin: {cors_header}")
        else:
            print("⚠️  Warning: CORS might not be configured")
            print("   Frontend may have issues fetching skills")
            print("\n   Add to app/main.py:")
            print("   from fastapi.middleware.cors import CORSMiddleware")
            print("   app.add_middleware(CORSMiddleware, allow_origins=['*'], ...)")
            
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Skills Endpoint Test")
    print("="*70)
    
    test_skills_endpoint()
    test_cors()
    
    print("\n" + "="*70)
    print("Tests completed!")
    print("="*70)
    
    print("\n📝 Quick test from browser console:")
    print("   fetch('http://localhost:8000/skills').then(r => r.json()).then(console.log)")
    print("\n")
