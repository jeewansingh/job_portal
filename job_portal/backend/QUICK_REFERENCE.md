# Quick Reference: Where Everything Happens

## 🎯 Your 4 Questions Answered

### 1. Where is exact match, alias, and Levenshtein checking?

**File:** `backend/app/repositories/skill_matching_repository.py`

**Function:** `match_skills()` (line ~110)

```python
for raw_skill in valid_skills:
    skill_name = normalize_skill_name(raw_skill)
    
    # TIER 1: Exact match
    matched = match_skill_exact(db, skill_name)  # ← Line ~45
    
    # TIER 2: Alias lookup  
    if not matched:
        matched = match_skill_alias(db, skill_name)  # ← Line ~60
    
    # TIER 3: Levenshtein distance
    if not matched:
        matched = match_skill_levenshtein_db(db, skill_name)  # ← Line ~80
```

---

### 2. What is purpose of `create_skill_aliases_table.sql`?

**Purpose:** Creates a database table to store skill aliases

**Table Structure:**
```sql
skill_aliases
├── id (primary key)
├── skill_id (foreign key to skills table)
└── alias (alternative name for the skill)
```

**Example Data:**
| id | skill_id | alias | → Actual Skill |
|----|----------|-------|----------------|
| 1  | 5        | js    | → JavaScript   |
| 2  | 12       | reactjs | → React      |
| 3  | 8        | nodejs | → Node.js     |

**Why needed?**
- Enables Tier 2 matching (alias lookup)
- Maps "js" → JavaScript, "reactjs" → React, etc.
- Easy to add more aliases without changing code

**How to use:**
```bash
psql -U postgres -d job_portal -f create_skill_aliases_table.sql
```

---

### 3. About Levenshtein library

**We DON'T use any external library!**

**File:** `backend/app/algorithms/skill_matching.py`

**Function:** `calculate_levenshtein_distance()` (line ~40)

```python
def calculate_levenshtein_distance(str1: str, str2: str) -> int:
    """
    PURE PYTHON IMPLEMENTATION - NO LIBRARIES
    
    Uses dynamic programming with 2D matrix.
    """
    # ... 50+ lines of pure Python code
    # Creates matrix, fills using DP
    # Returns minimum edit distance
```

**Algorithm:** Dynamic Programming (2D matrix)

**Example:**
```
"postgre" vs "postgres"

Matrix:
    ""  p  o  s  t  g  r  e  s
""   0  1  2  3  4  5  6  7  8
p    1  0  1  2  3  4  5  6  7
o    2  1  0  1  2  3  4  5  6
s    3  2  1  0  1  2  3  4  5
t    4  3  2  1  0  1  2  3  4
g    5  4  3  2  1  0  1  2  3
r    6  5  4  3  2  1  0  1  2
e    7  6  5  4  3  2  1  0  1

Result: Distance = 1 (need to add 's' at end)
```

---

### 4. What is work of "SKILL EXTRACTION" in service?

**File:** `backend/app/services/resume_service.py`

**Function:** `extract_skills_text()` (line ~150)

**What it does:**
1. Finds the "SKILLS" section in resume text
2. Splits by separators (comma, semicolon, pipe, slash)
3. Removes labels like "Languages:", "Tools:", "Frameworks:"
4. Returns list of **raw skill names** as strings

**Important:** It does NOT match skills! Just extracts text.

**Example:**

**Input (resume text):**
```
SKILLS
Languages: Python, js, react.js
Databases: postgre, MongoDB
```

**Processing:**
```python
extract_skills_text(sections)

# Step 1: Get SKILLS section
skills_lines = ["Languages: Python, js, react.js", "Databases: postgre, MongoDB"]

# Step 2: Remove labels
line = "Languages: Python, js, react.js"
line = line.replace("Languages:", "")  # "Python, js, react.js"

# Step 3: Split by comma
tokens = ["Python", "js", "react.js"]

# Step 4: Repeat for all lines
```

**Output:**
```python
["Python", "js", "react.js", "postgre", "MongoDB"]
```

**Then:** These raw strings are passed to `match_skills()` for three-tier matching.

---

## 📂 File Locations

### Backend Files

```
backend/
├── app/
│   ├── algorithms/
│   │   └── skill_matching.py          ← Levenshtein algorithm (pure Python)
│   │
│   ├── repositories/
│   │   └── skill_matching_repository.py  ← Three-tier matching logic
│   │
│   ├── services/
│   │   └── resume_service.py          ← Extract skills from PDF text
│   │
│   ├── routers/
│   │   └── resume.py                   ← POST /resume/upload endpoint
│   │
│   └── models/
│       └── skill_alias.py              ← SkillAlias database model
│
└── create_skill_aliases_table.sql     ← SQL script to create table
```

---

## 🔄 Complete Flow (Simplified)

```
1. User uploads PDF
   ↓
2. Router receives file + db session
   ↓
3. Service extracts text from PDF
   ↓
4. Service finds SKILLS section
   ↓
5. extract_skills_text() returns ["Python", "js", "reactjs"]
   ↓
6. For each skill, try:
   - Tier 1: Check skills table (exact match)
   - Tier 2: Check skill_aliases table (alias match)
   - Tier 3: Calculate Levenshtein distance (fuzzy match)
   ↓
7. Return matched skills with IDs and names
   ↓
8. Frontend auto-fills form
```

---

## 💡 Key Concepts

### 1. Raw Skills vs Matched Skills

**Raw Skills** (from PDF):
```python
["Python", "js", "react.js", "postgre"]
```

**Matched Skills** (after three-tier matching):
```python
[
    {"id": 1, "name": "Python"},      # Tier 1: Exact
    {"id": 5, "name": "JavaScript"},  # Tier 2: Alias (js → JavaScript)
    {"id": 12, "name": "React"},      # Tier 2: Alias (react.js → React)
    {"id": 23, "name": "PostgreSQL"}  # Tier 3: Levenshtein (postgre ≈ postgresql)
]
```

### 2. Why Three Tiers?

- **Tier 1 (Exact):** Fast, 100% accurate, handles most cases
- **Tier 2 (Alias):** Handles common variations without false positives
- **Tier 3 (Levenshtein):** Catches typos and minor misspellings

### 3. Why Pure Python?

- **Educational:** Shows algorithm implementation for college project
- **No Dependencies:** No need for external libraries
- **Transparent:** Can explain exactly how it works in viva

---

## 🧪 Testing the Flow

### Test 1: Exact Match
```
Resume: "Skills: Python, JavaScript"
↓ extract_skills_text()
["Python", "JavaScript"]
↓ match_skills()
Tier 1: Both found in DB
Result: [{"id": 1, "name": "Python"}, {"id": 5, "name": "JavaScript"}]
```

### Test 2: Alias Match
```
Resume: "Skills: js, reactjs, nodejs"
↓ extract_skills_text()
["js", "reactjs", "nodejs"]
↓ match_skills()
Tier 1: Not found
Tier 2: Found in skill_aliases table
Result: [{"id": 5, "name": "JavaScript"}, {"id": 12, "name": "React"}, ...]
```

### Test 3: Levenshtein Match
```
Resume: "Skills: pythno, javascrip, reactt"
↓ extract_skills_text()
["pythno", "javascrip", "reactt"]
↓ match_skills()
Tier 1: Not found
Tier 2: Not found
Tier 3: Calculate distances:
  - "pythno" vs "python" = 2 ✓
  - "javascrip" vs "javascript" = 1 ✓
  - "reactt" vs "react" = 1 ✓
Result: [{"id": 1, "name": "Python"}, {"id": 5, "name": "JavaScript"}, ...]
```

---

## 🚀 Quick Setup

1. **Create table:**
   ```bash
   psql -U postgres -d job_portal -f backend/create_skill_aliases_table.sql
   ```

2. **Restart backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

3. **Test:**
   - Go to registration page
   - Upload a resume
   - Watch form auto-fill

---

## 📖 For More Details

- **Complete flow:** `SKILL_MATCHING_FLOW_EXPLANATION.md`
- **Full documentation:** `RESUME_SKILL_MATCHING.md`
- **Setup guide:** `SETUP_SKILL_MATCHING.md`
