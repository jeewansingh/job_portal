"""
Test script to verify match score calculation is working
"""

from app.core.database import SessionLocal
from app.services.job_service import get_job_details

def test_match_score():
    """Test if match score is calculated for logged-in users"""
    
    db = SessionLocal()
    
    try:
        # Test parameters - adjust these to match your data
        job_id = 1  # Replace with an actual job ID from your database
        user_id = 1  # Replace with an actual user ID from your database
        
        print(f"Testing match score calculation...")
        print(f"Job ID: {job_id}")
        print(f"User ID: {user_id}")
        print("=" * 60)
        
        # Test 1: Without user_id (should be None)
        print("\n1. Testing WITHOUT user_id:")
        import asyncio
        job_data = asyncio.run(get_job_details(db, job_id, user_id=None))
        print(f"   Match Score: {job_data.get('match_score')}")
        print(f"   Expected: None")
        print(f"   Result: {'✓ PASS' if job_data.get('match_score') is None else '✗ FAIL'}")
        
        # Test 2: With user_id (should have a score)
        print("\n2. Testing WITH user_id:")
        job_data = asyncio.run(get_job_details(db, job_id, user_id=user_id))
        print(f"   Match Score: {job_data.get('match_score')}")
        print(f"   Expected: A number (0-100)")
        print(f"   Result: {'✓ PASS' if job_data.get('match_score') is not None else '✗ FAIL'}")
        
        if job_data.get('match_score') is not None:
            print(f"   Score Value: {job_data['match_score']:.2f}%")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("Match Score Calculation Test")
    print("=" * 60)
    
    # Check if data exists
    db = SessionLocal()
    try:
        from app.models.job import Job
        from app.models.user import User
        
        job_count = db.query(Job).count()
        user_count = db.query(User).count()
        
        print(f"Jobs in database: {job_count}")
        print(f"Users in database: {user_count}")
        
        if job_count == 0 or user_count == 0:
            print("\n⚠ No data to test. Please add jobs and users first.")
            exit(1)
        
        # Get first job and user
        first_job = db.query(Job).first()
        first_user = db.query(User).first()
        
        print(f"Using Job ID: {first_job.id} ({first_job.job_title})")
        print(f"Using User ID: {first_user.id} ({first_user.full_name})")
        
    finally:
        db.close()
    
    print("\n")
    test_match_score()
