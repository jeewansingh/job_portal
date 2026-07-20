# Skills Fix Summary

## Issue

User skills were not being inserted into the `user_skills` table during registration.

## Root Causes Identified

1. **Missing flush call** in `UserSkillRepository.create()` - records weren't being properly queued
2. **No validation** for empty skill strings
3. **No refresh** of user object after commit
4. **Skills parameter handling** needed to be optional and handle None values

## Changes Made

### 1. `app/repositories/user_skill_repository.py`

**Before:**
```python
@staticmethod
def create(db: Session, user_id: int, skill_id: int):
    user_skill = UserSkill(
        user_id=user_id,
        skill_id=skill_id
    )
    db.add(user_skill)
```

**After:**
```python
@staticmethod
def create(db: Session, user_id: int, skill_id: int):
    user_skill = UserSkill(
        user_id=user_id,
        skill_id=skill_id
    )
    db.add(user_skill)
    db.flush()  # ← Added: Ensure record is queued for commit
    return user_skill  # ← Added: Return the created object
```

**Why:** The `flush()` ensures that SQLAlchemy queues the INSERT statement before the final commit, preventing issues with transaction order.

### 2. `app/services/user_service.py`

**Before:**
```python
# Save user's skills
for skill_name in skills:
    skill = SkillRepository.get_by_name(db, skill_name)
    if skill:
        UserSkillRepository.create(db, user.id, skill.id)

db.commit()
return user
```

**After:**
```python
# Save user's skills
if skills:
    for skill_name in skills:
        # Skip empty strings
        if not skill_name or not skill_name.strip():
            continue

        skill = SkillRepository.get_by_name(db, skill_name.strip())
        if skill:
            UserSkillRepository.create(db, user.id, skill.id)

db.commit()
db.refresh(user)  # ← Added: Refresh user from database
return user
```

**Changes:**
- Added null check: `if skills:`
- Added empty string validation: `if not skill_name or not skill_name.strip()`
- Added `.strip()` to remove whitespace from skill names
- Added `db.refresh(user)` to ensure user object reflects database state

**Why:** 
- Prevents errors when skills is None or contains empty strings
- Handles whitespace issues in skill names
- Ensures returned user object is up-to-date

### 3. `app/routers/users.py`

**Before:**
```python
skills: List[str] = Form([]),
```

**After:**
```python
skills: Optional[List[str]] = Form(None),
```

**Why:** Makes skills truly optional and handles cases where no skills are sent.

### 4. Function signature update in `user_service.py`

**Before:**
```python
skills: List[str],
```

**After:**
```python
skills: Optional[List[str]],
```

**Why:** Matches the router signature and allows None values.

## Testing Tools Created

### 1. `test_skills_debug.py`
Comprehensive test script that:
- Tests registration with skills
- Shows SQL queries to verify data
- Tests with non-existent skills
- Provides debugging information

**Usage:**
```bash
python test_skills_debug.py
```

### 2. `populate_skills.sql`
SQL script to populate the skills table with common skills.

**Usage:**
```bash
psql -U postgres -d job_portal -f populate_skills.sql
```

### 3. `TROUBLESHOOTING_SKILLS.md`
Complete troubleshooting guide covering:
- All possible causes
- Step-by-step debugging
- SQL queries for verification
- Common mistakes
- Code examples

## How to Test

### Prerequisites
1. Ensure skills exist in database:
```sql
SELECT * FROM skills WHERE name IN ('Python', 'JavaScript', 'FastAPI');
```

If empty, run:
```bash
psql -U postgres -d job_portal -f populate_skills.sql
```

### Test Registration

**Using cURL:**
```bash
curl -X POST "http://localhost:8000/users/register" \
  -F "full_name=Test User" \
  -F "gender=Male" \
  -F "date_of_birth=1995-01-01" \
  -F "phone=+1234567890" \
  -F "email=test@example.com" \
  -F "password=TestPass123!" \
  -F "address=123 Test St" \
  -F "skills=Python" \
  -F "skills=JavaScript" \
  -F "skills=FastAPI"
```

**Using Python:**
```python
import requests

form_data = [
    ('full_name', 'Test User'),
    ('gender', 'Male'),
    ('date_of_birth', '1995-01-01'),
    ('phone', '+1234567890'),
    ('email', 'test@example.com'),
    ('password', 'TestPass123!'),
    ('address', '123 Test St'),
    ('skills', 'Python'),
    ('skills', 'JavaScript'),
    ('skills', 'FastAPI'),
]

response = requests.post(
    'http://localhost:8000/users/register',
    data=form_data
)

print(response.json())
```

### Verify in Database

```sql
-- Get the latest user
SELECT id, full_name, email FROM users ORDER BY id DESC LIMIT 1;

-- Check their skills (replace 123 with actual user_id)
SELECT 
    us.id,
    u.full_name,
    s.name as skill_name
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
WHERE us.user_id = 123;
```

Expected output:
```
 id | full_name | skill_name 
----+-----------+-------------
  1 | Test User | Python
  2 | Test User | JavaScript
  3 | Test User | FastAPI
```

## Key Points to Remember

1. **Skills are case-sensitive**: Use exact names from database
   - ✓ "Python"
   - ✗ "python"

2. **Multiple form fields**: Send skills as multiple form fields, not JSON array
   - ✓ `-F "skills=Python" -F "skills=JavaScript"`
   - ✗ `-F "skills=['Python', 'JavaScript']"`

3. **Skills must exist**: Only skills that exist in the `skills` table will be added
   - Non-existent skills are silently skipped
   - No error is thrown for invalid skills

4. **Skills are optional**: Registration works without skills

## Verification Checklist

After implementing these changes:

- [x] `db.flush()` added to `UserSkillRepository.create()`
- [x] Skills validation added to `user_service.py`
- [x] `db.refresh(user)` added after commit
- [x] Skills parameter is Optional in router and service
- [x] Skills table is populated with test data
- [x] Test scripts created for debugging
- [x] Troubleshooting guide created

## Expected Behavior

### Scenario 1: Registration with valid skills
- ✓ User is created
- ✓ Skills are inserted into user_skills
- ✓ Response includes user data

### Scenario 2: Registration with some invalid skills
- ✓ User is created
- ✓ Only valid skills are inserted
- ✓ Invalid skills are silently skipped
- ✓ No error thrown

### Scenario 3: Registration without skills
- ✓ User is created
- ✓ No user_skills records created
- ✓ No error thrown

### Scenario 4: Registration with empty skill strings
- ✓ User is created
- ✓ Empty strings are skipped
- ✓ Other valid skills are inserted

## Database Queries for Monitoring

### Check recent user registrations with their skills:
```sql
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.created_at,
    COUNT(us.id) as skill_count,
    STRING_AGG(s.name, ', ') as skills
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.id
WHERE u.created_at > NOW() - INTERVAL '1 day'
GROUP BY u.id, u.full_name, u.email, u.created_at
ORDER BY u.created_at DESC;
```

### Check orphaned user_skills (shouldn't exist):
```sql
-- User skills with non-existent users
SELECT * FROM user_skills 
WHERE user_id NOT IN (SELECT id FROM users);

-- User skills with non-existent skills
SELECT * FROM user_skills 
WHERE skill_id NOT IN (SELECT id FROM skills);
```

Both queries should return 0 rows.

## Support

If issues persist:
1. Run `python test_skills_debug.py`
2. Check FastAPI console for errors
3. Review `TROUBLESHOOTING_SKILLS.md`
4. Verify SQL queries above
5. Enable SQL logging: `engine = create_engine(DATABASE_URL, echo=True)`
