#!/usr/bin/env python3
"""
Test all imports to ensure backend can start without errors
"""

print("Testing backend imports...")
print("=" * 60)

errors = []

# Test 1: Model imports
print("\n1. Testing model imports...")
try:
    from app.models.skill_alias import SkillAlias
    print("   ✓ SkillAlias model")
except Exception as e:
    print(f"   ❌ SkillAlias model: {e}")
    errors.append(("SkillAlias model", str(e)))

# Test 2: Algorithm imports
print("\n2. Testing algorithm imports...")
try:
    from app.algorithms.skill_matching import (
        calculate_levenshtein_distance,
        match_skill_levenshtein,
        normalize_skill_name
    )
    print("   ✓ skill_matching algorithm")
    
    # Quick test
    dist = calculate_levenshtein_distance("python", "python")
    assert dist == 0, "Levenshtein distance test failed"
    print("   ✓ Levenshtein calculation works (distance 0)")
    
    dist = calculate_levenshtein_distance("react", "reactjs")
    print(f"   ✓ Levenshtein calculation works (react vs reactjs = {dist})")
    
except Exception as e:
    print(f"   ❌ skill_matching algorithm: {e}")
    errors.append(("skill_matching algorithm", str(e)))

# Test 3: Repository imports
print("\n3. Testing repository imports...")
try:
    from app.repositories.skill_matching_repository import (
        match_skill_exact,
        match_skill_alias,
        match_skills
    )
    print("   ✓ skill_matching_repository")
except Exception as e:
    print(f"   ❌ skill_matching_repository: {e}")
    errors.append(("skill_matching_repository", str(e)))

# Test 4: Service imports
print("\n4. Testing service imports...")
try:
    from app.services.resume_service import extract_resume
    print("   ✓ resume_service")
except Exception as e:
    print(f"   ❌ resume_service: {e}")
    errors.append(("resume_service", str(e)))

# Test 5: Router imports
print("\n5. Testing router imports...")
try:
    from app.routers.resume import router
    print("   ✓ resume router")
except Exception as e:
    print(f"   ❌ resume router: {e}")
    errors.append(("resume router", str(e)))

# Test 6: Schema imports
print("\n6. Testing schema imports...")
try:
    from app.schemas.resume import ResumeResponse, SkillMatch
    print("   ✓ resume schemas")
except Exception as e:
    print(f"   ❌ resume schemas: {e}")
    errors.append(("resume schemas", str(e)))

# Test 7: Main app import
print("\n7. Testing main app import...")
try:
    from app.main import app
    print("   ✓ FastAPI app")
except Exception as e:
    print(f"   ❌ FastAPI app: {e}")
    errors.append(("FastAPI app", str(e)))

print("\n" + "=" * 60)

if errors:
    print("\n❌ ERRORS FOUND:")
    for name, error in errors:
        print(f"\n{name}:")
        print(f"  {error}")
    print("\nFIX these errors before starting the backend!")
    exit(1)
else:
    print("\n✅ ALL IMPORTS SUCCESSFUL!")
    print("\nYou can now start the backend:")
    print("  uvicorn app.main:app --reload --port 8000")
    exit(0)
