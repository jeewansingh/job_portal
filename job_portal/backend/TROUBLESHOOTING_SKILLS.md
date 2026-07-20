# Troubleshooting: Skills Not Inserted in user_skills Table

## Problem

User registration completes successfully, but no records are inserted into the `user_skills` table.

## Possible Causes and Solutions

### 1. Skills Table is Empty

**Cause:** The skills you're trying to add don't exist in the `skills` table.

**Check:**
```sql
SELECT * FROM skills WHERE name IN ('Python', 'JavaScript', 'FastAPI');
```

**Solution:**
Run the provided SQL script to populate the skills table:
```bash
psql -U postgres -d job_portal -f populate_skills.sql
```

Or manually insert skills:
```sql
INSERT INTO skills (name, category) VALUES
    ('Python', 'Programming Languages'),
    ('JavaScript', 'Programming Languages'),
    ('FastAPI', 'Backend')
ON CONFLICT (name) DO NOTHING;
```

### 2. Skills Not Being Sent Correctly

**Cause:** Skills array is not being sent properly in the multipart/form-data request.

**Correct Format:**

**cURL:**
```bash
curl -X POST "http://localhost:8000/users/register" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "password=Pass123!" \
  -F "skills=Python" \
  -F "skills=JavaScript" \
  -F "skills=FastAPI"
```

**Python requests:**
```python
form_data = [
    ('full_name', 'John Doe'),
    ('email', 'john@example.com'),
    ('password', 'Pass123!'),
    ('skills', 'Python'),
    ('skills', 'JavaScript'),
    ('skills', 'FastAPI'),
]

response = requests.post(
    'http://localhost:8000/users/register',
    data=form_data
)
```

**JavaScript/FormData:**
```javascript
const formData = new FormData();
formData.append('full_name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'Pass123!');
formData.append('skills', 'Python');
formData.append('skills', 'JavaScript');
formData.append('skills', 'FastAPI');

fetch('http://localhost:8000/users/register', {
  method: 'POST',
  body: formData
});
```

### 3. Case Sensitivity Issues

**Cause:** Skill names are case-sensitive. "python" ≠ "Python"

**Check:**
```sql
-- Check exact names in database
SELECT name FROM skills ORDER BY name;
```

**Solution:** Use the exact case as stored in the database:
- ✓ "Python" (correct)
- ✗ "python" (wrong)
- ✗ "PYTHON" (wrong)

### 4. Database Transaction Issues

**Cause:** Transaction might be rolling back due to an error.

**Solution:** Check application logs for errors during registration.

**Verify the fix is applied:**
Check that `user_skill_repository.py` has the flush call:
```python
def create(db: Session, user_id: int, skill_id: int):
    user_skill = UserSkill(
        user_id=user_id,
        skill_id=skill_id
    )
    db.add(user_skill)
    db.flush()  # ← This should be present
    return user_skill
```

### 5. Skills Parameter is None or Empty

**Cause:** Skills parameter is not being received by the endpoint.

**Debug:** Add logging to see what's being received:
```python
# In user_service.py, add at the beginning:
print(f"DEBUG: Received skills: {skills}")
print(f"DEBUG: Skills type: {type(skills)}")
```

### 6. Foreign Key Constraint Issues

**Cause:** The user_id or skill_id doesn't exist when trying to insert.

**Check:**
```sql
-- Verify foreign key constraints
SELECT
    conname,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
AND conrelid = 'user_skills'::regclass;
```

## Debugging Steps

### Step 1: Verify Skills Exist
```sql
SELECT id, name FROM skills WHERE name IN ('Python', 'JavaScript', 'FastAPI');
```

Expected output:
```
 id |    name     
----+-------------
  1 | Python
  2 | JavaScript
  3 | FastAPI
```

### Step 2: Run Debug Test
```bash
cd backend
python test_skills_debug.py
```

This will:
- Test registration with skills
- Show SQL queries to verify data
- Test with non-existent skills

### Step 3: Check User Creation
```sql
-- Get the most recent user
SELECT id, full_name, email FROM users ORDER BY id DESC LIMIT 1;
```

Note the user ID, then check user_skills:

### Step 4: Check user_skills Table
```sql
-- Replace 123 with actual user_id from step 3
SELECT * FROM user_skills WHERE user_id = 123;
```

Expected output:
```
 id | user_id | skill_id 
----+---------+----------
  1 |     123 |        1
  2 |     123 |        2
  3 |     123 |        3
```

If empty, there's a problem.

### Step 5: Check Application Logs

Look for errors in the FastAPI console output when registration occurs.

Common errors:
- `ForeignKeyViolation`: skill_id doesn't exist
- `IntegrityError`: Constraint violation
- `AttributeError`: Issue with skill object

## Testing the Fix

### Test 1: Simple Registration with Skills
```bash
curl -X POST "http://localhost:8000/users/register" \
  -F "full_name=Test User" \
  -F "gender=Male" \
  -F "date_of_birth=1995-01-01" \
  -F "phone=+1234567890" \
  -F "email=test$(date +%s)@example.com" \
  -F "password=TestPass123!" \
  -F "address=123 Test St" \
  -F "skills=Python" \
  -F "skills=JavaScript"
```

### Test 2: Verify in Database
```sql
-- Get latest user
SELECT id, full_name FROM users ORDER BY id DESC LIMIT 1;

-- Check their skills (replace 999 with actual user_id)
SELECT s.name 
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
WHERE us.user_id = 999;
```

Expected output:
```
    name     
-------------
 Python
 JavaScript
```

## Common Mistakes

### ❌ Wrong: Sending skills as JSON array
```bash
# This WON'T work with multipart/form-data
-F "skills=['Python', 'JavaScript']"
```

### ✓ Correct: Sending skills as multiple fields
```bash
-F "skills=Python" \
-F "skills=JavaScript"
```

### ❌ Wrong: Case mismatch
```python
skills = ['python', 'javascript']  # lowercase
```

### ✓ Correct: Exact case from database
```python
skills = ['Python', 'JavaScript']  # proper case
```

## Code Changes Made

### 1. Updated `user_skill_repository.py`
Added `db.flush()` to ensure records are queued before commit:
```python
db.add(user_skill)
db.flush()  # ← Added
return user_skill
```

### 2. Updated `user_service.py`
Added validation for empty skills and strip whitespace:
```python
if skills:
    for skill_name in skills:
        if not skill_name or not skill_name.strip():
            continue  # Skip empty strings
        
        skill = SkillRepository.get_by_name(db, skill_name.strip())
        if skill:
            UserSkillRepository.create(db, user.id, skill.id)
```

### 3. Updated `users.py` router
Changed skills parameter to Optional:
```python
skills: Optional[List[str]] = Form(None),
```

## Quick Verification Checklist

- [ ] Skills exist in `skills` table
- [ ] Skills are being sent as multiple form fields (not JSON array)
- [ ] Skill names match exact case in database
- [ ] `user_skill_repository.py` has `db.flush()` call
- [ ] `user_service.py` has skills validation
- [ ] No errors in application logs
- [ ] Database foreign keys are properly set up
- [ ] User was created successfully (check `users` table)

## If Still Not Working

1. **Enable SQL logging** to see actual queries:
   ```python
   # In database.py
   engine = create_engine(DATABASE_URL, echo=True)  # Add echo=True
   ```

2. **Add debug logging** in user_service.py:
   ```python
   print(f"DEBUG: Processing {len(skills) if skills else 0} skills")
   for skill_name in skills:
       skill = SkillRepository.get_by_name(db, skill_name.strip())
       print(f"DEBUG: Skill '{skill_name}' -> {skill.id if skill else 'NOT FOUND'}")
   ```

3. **Test directly in Python**:
   ```python
   from sqlalchemy.orm import Session
   from app.core.database import SessionLocal
   from app.repositories.skill_repository import SkillRepository
   
   db = SessionLocal()
   skill = SkillRepository.get_by_name(db, "Python")
   print(f"Python skill: {skill.id if skill else 'NOT FOUND'}")
   ```

## Need More Help?

Provide the following information:
1. Output from `python test_skills_debug.py`
2. SQL query result: `SELECT * FROM skills LIMIT 5;`
3. SQL query result: `SELECT * FROM user_skills LIMIT 5;`
4. FastAPI console logs during registration
5. The exact curl/request code being used
