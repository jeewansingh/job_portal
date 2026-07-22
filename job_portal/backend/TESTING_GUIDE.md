# Testing Guide: Resume Skill Matching

## ✅ Pre-Testing Checklist

Before testing, ensure:
- ✅ `skill_aliases` table exists in database (you already have this!)
- ✅ Backend imports updated (`skill_alias` in main.py and models/__init__.py)
- ✅ Backend server is running
- ✅ Frontend is running

## 🧪 Test Cases

### Test 1: Verify Database Setup

**Check if skill_aliases table is accessible:**

```bash
cd backend
python3 -c "
from app.core.database import SessionLocal
from app.models.skill_alias import SkillAlias
from app.models.skill import Skill

db = SessionLocal()
aliases = db.query(SkillAlias).join(Skill).limit(5).all()
for alias in aliases:
    print(f'Alias: {alias.alias} → Skill: {alias.skill.name}')
db.close()
"
```

**Expected output:**
```
Alias: js → Skill: JavaScript
Alias: reactjs → Skill: React
Alias: nodejs → Skill: Node.js
...
```

If this works, your database connection and model are correct!

---

### Test 2: Test Three-Tier Matching Directly

**Create a test script:**

```bash
cd backend
cat > test_skill_matching.py << 'EOF'
from app.core.database import SessionLocal
from app.repositories.skill_matching_repository import match_skills

# Test data
raw_skills = [
    "Python",        # Should match via Tier 1 (exact)
    "js",            # Should match via Tier 2 (alias)
    "reactjs",       # Should match via Tier 2 (alias)
    "postgre",       # Should match via Tier 3 (Levenshtein) if PostgreSQL exists
    "django",        # Should match via Tier 1 (exact)
    "nonexistent",   # Should NOT match (no close skill)
]

db = SessionLocal()

print("Testing Three-Tier Skill Matching\n")
print("Input skills:", raw_skills)
print("\n" + "="*60 + "\n")

matched = match_skills(db, raw_skills)

print(f"Matched {len(matched)} out of {len(raw_skills)} skills:\n")
for skill in matched:
    print(f"  ✓ ID: {skill['id']}, Name: {skill['name']}")

db.close()

print("\n" + "="*60)
print("\nTesting individual tiers:\n")

from app.repositories.skill_matching_repository import (
    match_skill_exact,
    match_skill_alias,
    match_skill_levenshtein_db
)

db = SessionLocal()

# Test Tier 1
result = match_skill_exact(db, "python")
print(f"Tier 1 (exact) - 'python': {result}")

# Test Tier 2
result = match_skill_alias(db, "js")
print(f"Tier 2 (alias) - 'js': {result}")

# Test Tier 3
result = match_skill_levenshtein_db(db, "postgre", max_distance=2)
print(f"Tier 3 (Levenshtein) - 'postgre': {result}")

db.close()
EOF

python3 test_skill_matching.py
```

**Expected output:**
```
Testing Three-Tier Skill Matching

Input skills: ['Python', 'js', 'reactjs', 'postgre', 'django', 'nonexistent']

============================================================

Matched 5 out of 6 skills:

  ✓ ID: 1, Name: Python
  ✓ ID: 5, Name: JavaScript
  ✓ ID: 12, Name: React
  ✓ ID: 23, Name: PostgreSQL
  ✓ ID: 15, Name: Django

============================================================

Testing individual tiers:

Tier 1 (exact) - 'python': {'id': 1, 'name': 'Python'}
Tier 2 (alias) - 'js': {'id': 5, 'name': 'JavaScript'}
Tier 3 (Levenshtein) - 'postgre': {'id': 23, 'name': 'PostgreSQL'}
```

---

### Test 3: Test Resume Upload API Endpoint

**Using curl:**

First, create a test resume PDF or use an existing one. Then:

```bash
# Test the endpoint
curl -X POST http://localhost:8000/resume/upload \
  -F "file=@path/to/your/resume.pdf" \
  | jq .
```

**Expected response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "education": "Bachelor of Computer Science",
  "portfolio": [
    "https://github.com/johndoe"
  ],
  "projects": [
    "E-commerce Website",
    "Mobile App"
  ],
  "skills": [
    {
      "id": 1,
      "name": "Python"
    },
    {
      "id": 5,
      "name": "JavaScript"
    },
    {
      "id": 12,
      "name": "React"
    }
  ]
}
```

**Key checks:**
- ✅ Skills should be array of objects with `id` and `name`
- ✅ Skill IDs should match your database
- ✅ Skills should be matched via three-tier strategy

---

### Test 4: Test Frontend Auto-Fill

**Steps:**

1. **Start backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to registration:**
   ```
   http://localhost:5173/register
   ```

4. **Upload a resume with skills:**
   - Click "Upload Resume"
   - Select a PDF with skills section
   - Example skills in PDF: "Python, js, reactjs, django"

5. **Verify auto-fill:**
   - ✅ Name field should populate
   - ✅ Email field should populate
   - ✅ Phone field should populate
   - ✅ Education field should populate
   - ✅ Skills should appear in skill selector
   - ✅ You can edit all fields
   - ✅ You can add/remove skills

6. **Check browser console:**
   - Should see: "Resume parsed successfully! Found X skills..."
   - No errors

7. **Submit registration:**
   - Fill remaining required fields
   - Submit form
   - Verify registration succeeds

---

### Test 5: Test Different Skill Formats

**Create test PDFs with different skill formats:**

**Test PDF 1: Exact matches**
```
SKILLS
Python, JavaScript, React, Django, PostgreSQL
```
Expected: All should match via Tier 1

**Test PDF 2: Aliases**
```
SKILLS
py, js, reactjs, nodejs, postgres
```
Expected: All should match via Tier 2 (using your existing aliases)

**Test PDF 3: Typos**
```
SKILLS
pythno, javascrip, reactt, djanggo
```
Expected: Should match via Tier 3 (Levenshtein) if distance ≤ 2

**Test PDF 4: Mixed**
```
SKILLS
Python, js, reactjs, postgre, machien learning
```
Expected: Mix of all three tiers

**Test PDF 5: Different separators**
```
SKILLS
Python | JavaScript | React
Technologies: Django; Flask; FastAPI
Tools: Git / Docker / Kubernetes
```
Expected: All should be extracted and matched

---

### Test 6: Test Edge Cases

**Edge Case 1: Resume with no skills section**
- Upload resume without SKILLS section
- Expected: `skills: []` in response
- Form should not auto-fill skills

**Edge Case 2: Empty skills section**
```
SKILLS
(empty)
```
- Expected: `skills: []` in response

**Edge Case 3: Invalid skill names**
```
SKILLS
abc, xyz, 123, !!!
```
- Expected: No matches (or very few if by chance)

**Edge Case 4: Very long skill list**
```
SKILLS
Python, JavaScript, React, Angular, Vue, Django, Flask, FastAPI,
Node.js, Express, MongoDB, PostgreSQL, MySQL, Redis, Docker,
Kubernetes, AWS, Azure, Git, ... (50+ skills)
```
- Expected: All valid skills matched
- Performance should be acceptable

---

## 🐛 Troubleshooting

### Issue: "Module 'Levenshtein' not found"

**Check:**
```bash
cd backend
grep -r "from Levenshtein import" app/
```

**Should return:** Nothing! We use pure Python implementation.

**If found:** Update `app/algorithms/skill_matching.py` to remove the import.

---

### Issue: "relation 'skill_aliases' does not exist"

**Verify table exists:**
```sql
psql -U postgres -d job_portal -c "\dt skill_aliases"
```

**Check model import:**
```bash
cd backend
python3 -c "from app.models.skill_alias import SkillAlias; print('Model imported successfully')"
```

---

### Issue: Skills not matching

**Debug with:**
```python
# backend/test_debug.py
from app.core.database import SessionLocal
from app.repositories.skill_matching_repository import (
    match_skill_exact,
    match_skill_alias,
    match_skill_levenshtein_db,
    normalize_skill_name
)

db = SessionLocal()

test_skill = "js"  # Change this to test different skills

print(f"Testing: {test_skill}")
print(f"Normalized: {normalize_skill_name(test_skill)}")

# Tier 1
print(f"\nTier 1 (exact): {match_skill_exact(db, test_skill)}")

# Tier 2
print(f"Tier 2 (alias): {match_skill_alias(db, test_skill)}")

# Tier 3
print(f"Tier 3 (Levenshtein): {match_skill_levenshtein_db(db, test_skill)}")

db.close()
```

---

### Issue: Frontend not auto-filling

**Check browser console:**
- Look for errors
- Check network tab for `/resume/upload` request
- Verify response format

**Check handler:**
```javascript
// In Register.jsx
const handleResumeChange = async (e) => {
  console.log("Resume file selected:", e.target.files[0]);
  
  try {
    const extractedData = await uploadResume(file);
    console.log("Extracted data:", extractedData);
    console.log("Skills:", extractedData.skills);
    // ...
  } catch (err) {
    console.error("Error:", err);
  }
};
```

---

## ✅ Success Criteria

Your implementation is working correctly if:

1. ✅ Database queries return aliases correctly
2. ✅ Three-tier matching test script works
3. ✅ API endpoint returns skills with `{id, name}` format
4. ✅ Frontend auto-fills form on resume upload
5. ✅ User can edit auto-filled values
6. ✅ Registration submits successfully
7. ✅ Data saves to database correctly

---

## 📊 Performance Benchmarks

**Typical performance:**
- Tier 1 (exact): < 1ms per skill
- Tier 2 (alias): < 2ms per skill
- Tier 3 (Levenshtein): < 50ms per skill (depends on skill count in DB)

**For 10 skills in resume:**
- Total matching time: < 100ms
- PDF parsing time: ~200-500ms
- Total response time: < 1 second

---

## 🎓 Demo Tips for College Project

**Show these during presentation:**

1. **Database Structure:**
   - Show `skill_aliases` table with data
   - Explain foreign key relationship

2. **Algorithm:**
   - Show Levenshtein function with matrix
   - Explain dynamic programming approach

3. **Live Demo:**
   - Upload resume with mixed skill formats
   - Show auto-fill in real-time
   - Demonstrate edit capability

4. **Code Walkthrough:**
   - Show three-tier matching logic
   - Explain each tier's purpose
   - Show pure Python Levenshtein implementation

**Questions they might ask:**
- Q: "Why three tiers?"
  - A: Balances speed, accuracy, and flexibility
  
- Q: "Why not just use exact match?"
  - A: People write skills differently (js vs JavaScript)
  
- Q: "What is Levenshtein distance?"
  - A: Minimum edits needed to transform one string to another
  
- Q: "Why max_distance = 2?"
  - A: Catches typos but prevents false positives

Good luck with your testing!
