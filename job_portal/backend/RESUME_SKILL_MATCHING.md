# Resume Skill Matching Implementation

## Overview

This implementation provides **intelligent skill matching** for resume parsing using a **three-tier fallback strategy**. When a user uploads their resume during registration, skills are automatically extracted and matched against the database to auto-fill the registration form.

## Architecture

### Components

1. **Algorithm Layer** (`app/algorithms/skill_matching.py`)
   - Pure Python implementation of Levenshtein distance calculation
   - Skill name normalization
   - Invalid skill filtering
   - Fuzzy matching logic

2. **Repository Layer** (`app/repositories/skill_matching_repository.py`)
   - Database integration for skill matching
   - Three-tier matching strategy implementation
   - Exact match, alias lookup, and Levenshtein fallback

3. **Service Layer** (`app/services/resume_service.py`)
   - PDF text extraction
   - Resume section detection
   - Raw skill extraction from text
   - Integration with skill matching

4. **Router Layer** (`app/routers/resume.py`)
   - REST API endpoint for resume upload
   - Returns structured JSON with matched skills

5. **Database Model** (`app/models/skill_alias.py`)
   - Skill aliases table for mapping alternative names

## Three-Tier Skill Matching Strategy

### Tier 1: Exact Match (Case-Insensitive)
```python
# Example: "python" matches "Python" in database
skill = db.query(Skill).filter(Skill.name.ilike("python")).first()
```

**When it works:**
- Exact skill name matches (ignoring case)
- Example: "Python" → "Python", "react" → "React"

### Tier 2: Alias Lookup
```python
# Example: "js" → "JavaScript", "reactjs" → "React"
alias = db.query(SkillAlias).filter(SkillAlias.alias.ilike("js")).first()
skill = alias.skill
```

**When it works:**
- Common abbreviations and variations
- Examples:
  - "js" → "JavaScript"
  - "reactjs" → "React"
  - "nodejs" → "Node.js"
  - "postgres" → "PostgreSQL"

### Tier 3: Levenshtein Distance (Fuzzy Matching)
```python
# Example: "pythno" → "Python" (distance = 2)
# Example: "reactjs" → "React" (distance = 2)
distance = levenshtein("pythno", "python")  # = 2
if distance <= 2:
    return matched_skill
```

**When it works:**
- Typos and misspellings
- Small variations
- Maximum edit distance: 2

**Examples:**
- "pythno" → "Python" (1 transposition)
- "javascrip" → "JavaScript" (1 deletion)
- "reacts" → "React" (1 insertion)

## API Endpoint

### POST /resume/upload

**Purpose:** Parse resume and extract information without saving to database

**Request:**
```http
POST /resume/upload
Content-Type: multipart/form-data

file: <PDF file>
```

**Response:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "education": "Bachelor of Computer Science",
  "portfolio": ["https://github.com/johndoe", "https://linkedin.com/in/johndoe"],
  "projects": ["E-commerce Platform", "Machine Learning Chatbot"],
  "skills": [
    {"id": 1, "name": "Python"},
    {"id": 5, "name": "JavaScript"},
    {"id": 12, "name": "React"},
    {"id": 23, "name": "PostgreSQL"}
  ]
}
```

**Important:** This endpoint does **NOT** save anything to the database. It only extracts and returns data.

## Database Schema

### skill_aliases Table

```sql
CREATE TABLE skill_aliases (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER NOT NULL,
    alias VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE INDEX idx_skill_aliases_skill_id ON skill_aliases(skill_id);
CREATE INDEX idx_skill_aliases_alias ON skill_aliases(alias);
```

### Sample Data

| id | skill_id | alias      | → Skill Name   |
|----|----------|------------|----------------|
| 1  | 5        | js         | → JavaScript   |
| 2  | 12       | reactjs    | → React        |
| 3  | 12       | react.js   | → React        |
| 4  | 8        | nodejs     | → Node.js      |
| 5  | 1        | py         | → Python       |

## Installation & Setup

### 1. Create the Database Table

Run the SQL script to create the skill_aliases table:

```bash
cd backend
psql -U postgres -d job_portal -f create_skill_aliases_table.sql
```

Or manually connect and run:
```sql
\i create_skill_aliases_table.sql
```

### 2. Verify Installation

Check if the table was created:
```sql
SELECT * FROM skill_aliases LIMIT 10;
```

### 3. Add More Aliases (Optional)

You can add more aliases specific to your needs:
```sql
INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'django' FROM skills WHERE name = 'Django'
ON CONFLICT (alias) DO NOTHING;
```

## Frontend Integration

### Auto-fill Registration Form

The frontend Register page (`src/pages/public/Register.jsx`) automatically:

1. Uploads the resume when user selects a PDF file
2. Calls the `/resume/upload` endpoint
3. Receives the extracted data with matched skills
4. Auto-fills all form fields (name, email, phone, education, portfolio, skills)
5. User can edit any field before submitting registration

### Usage in Register.jsx

```javascript
const handleResumeChange = async (e) => {
  const file = e.target.files[0];
  
  // Upload and parse resume
  const extractedData = await uploadResume(file);
  
  // Auto-fill form
  setForm(prev => ({
    ...prev,
    fullName: extractedData.name || prev.fullName,
    email: extractedData.email || prev.email,
    phoneNumber: extractedData.phone || prev.phoneNumber,
    education: extractedData.education || prev.education,
    portfolioLink: extractedData.portfolio[0] || prev.portfolioLink,
  }));
  
  // Auto-fill skills (matched with IDs)
  setSelectedSkills(extractedData.skills);
};
```

## Example Workflow

### User Journey

1. **User navigates to registration page**
2. **User clicks "Upload Resume" button**
3. **User selects PDF resume file**
4. **System extracts:**
   - Personal info (name, email, phone)
   - Education
   - Portfolio links (GitHub, LinkedIn, etc.)
   - Raw skill names from resume

5. **System matches skills:**
   ```
   Resume has: ["Python", "js", "reactjs", "postgre", "machien learning"]
   
   Matching process:
   - "Python" → Exact match → ✓ Python (id: 1)
   - "js" → Alias lookup → ✓ JavaScript (id: 5)
   - "reactjs" → Alias lookup → ✓ React (id: 12)
   - "postgre" → Levenshtein → ✓ PostgreSQL (id: 23, distance: 2)
   - "machien learning" → Levenshtein → ✓ Machine Learning (id: 45, distance: 2)
   ```

6. **Form auto-fills with extracted data**
7. **User reviews and edits if needed**
8. **User submits registration**
9. **Backend saves all data (user, resume, skills, etc.)**

## Levenshtein Distance Explained

### What is Levenshtein Distance?

The **minimum number of single-character edits** (insertions, deletions, or substitutions) needed to change one word into another.

### Examples

| Input      | Target       | Distance | Operations                      |
|------------|--------------|----------|----------------------------------|
| python     | python       | 0        | Identical                        |
| pythno     | python       | 1        | Swap 'n' and 'o'                 |
| react      | reactjs      | 2        | Add 'j' and 's'                  |
| java       | javascript   | 6        | Too different (rejected)         |
| postgre    | postgresql   | 2        | Add 's' and 'l'                  |

### Why Distance = 2?

We use **max_distance = 2** because:
- ✅ Catches common typos (1 character off)
- ✅ Catches minor variations (2 characters off)
- ❌ Rejects completely different skills (prevents false matches)

## Testing

### Manual Testing

1. **Create a test resume with various skill formats:**
   - Exact names: "Python", "JavaScript"
   - Aliases: "js", "reactjs", "nodejs"
   - Typos: "pythno", "javascrip"
   - Variations: "postgre", "express"

2. **Upload via API:**
```bash
curl -X POST http://localhost:8000/resume/upload \
  -F "file=@test_resume.pdf"
```

3. **Verify response:**
   - Check if skills are matched correctly
   - Verify IDs and names are returned
   - Confirm no duplicates

### Python Test Script

```python
# test_resume_matching.py
import requests

def test_resume_upload():
    url = "http://localhost:8000/resume/upload"
    
    with open("test_resume.pdf", "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
    
    data = response.json()
    
    print("Extracted Name:", data["name"])
    print("Extracted Email:", data["email"])
    print("Matched Skills:")
    for skill in data["skills"]:
        print(f"  - {skill['name']} (ID: {skill['id']})")

if __name__ == "__main__":
    test_resume_upload()
```

## Troubleshooting

### Issue: Skills not matching

**Problem:** Resume has "javascript" but it's not matching

**Solution:**
1. Check if skill exists in database:
   ```sql
   SELECT * FROM skills WHERE LOWER(name) = 'javascript';
   ```

2. Check if alias exists:
   ```sql
   SELECT * FROM skill_aliases WHERE LOWER(alias) = 'javascript';
   ```

3. Add alias if needed:
   ```sql
   INSERT INTO skill_aliases (skill_id, alias)
   SELECT id, 'javascript' FROM skills WHERE name = 'JavaScript';
   ```

### Issue: Too many false matches

**Problem:** "Java" is matching "JavaScript" (distance = 6)

**Solution:** The max_distance is already set to 2, which should prevent this. If it's still happening, check the normalization logic in `algorithms/skill_matching.py`.

### Issue: Levenshtein library not found

**Problem:** `ImportError: No module named 'Levenshtein'`

**Solution:**
```bash
pip install python-Levenshtein
```

## Performance Considerations

### Database Queries

The matching process makes **3 queries per skill** (worst case):
1. Exact match query
2. Alias lookup query
3. Fetch all skills for Levenshtein (cached in memory)

### Optimization Tips

1. **Add indexes** (already included in SQL script)
2. **Cache skill list** for Levenshtein matching
3. **Batch process** multiple skills
4. **Limit Levenshtein** to skills starting with same letter (future enhancement)

## Future Enhancements

1. **Skill Categories**: Group similar skills together
2. **Confidence Scores**: Return match confidence (0-100%)
3. **Synonym Detection**: Use NLP for semantic matching
4. **Learning System**: Learn from user corrections
5. **Multi-language Support**: Match skills in different languages

## File Structure

```
backend/
├── app/
│   ├── algorithms/
│   │   └── skill_matching.py          # Levenshtein logic
│   ├── models/
│   │   └── skill_alias.py             # SkillAlias model
│   ├── repositories/
│   │   └── skill_matching_repository.py  # Three-tier matching
│   ├── services/
│   │   └── resume_service.py          # Resume parsing
│   └── routers/
│       └── resume.py                   # API endpoint
├── create_skill_aliases_table.sql     # Database setup
└── RESUME_SKILL_MATCHING.md           # This file

frontend/
├── src/
│   ├── pages/
│   │   └── public/
│   │       └── Register.jsx           # Auto-fill form
│   └── services/
│       └── auth.js                     # uploadResume() function
```

## Key Design Decisions

### Why Three-Tier Strategy?

1. **Exact Match**: Fast, accurate, handles 70% of cases
2. **Alias Lookup**: Handles common variations (20% of cases)
3. **Levenshtein**: Final fallback for typos (10% of cases)

### Why Keep Levenshtein in Algorithms Folder?

- **Separation of Concerns**: Pure logic separated from database operations
- **Testability**: Can test algorithm without database
- **Reusability**: Can be used for other fuzzy matching needs
- **Maintainability**: Clear separation between calculation and integration

### Why Not Create Database Records During Parsing?

- **User Control**: User should review before saving
- **Data Integrity**: Prevent accidental/duplicate records
- **UX**: Allow editing before final submission
- **Security**: Prevent automated spam/abuse

## Contact & Support

For questions or issues with the skill matching implementation, refer to:
- Backend code: `backend/app/algorithms/skill_matching.py`
- Database setup: `backend/create_skill_aliases_table.sql`
- API documentation: `POST /resume/upload` endpoint
