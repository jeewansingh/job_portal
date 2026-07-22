# Quick Setup Guide: Resume Skill Matching

## Prerequisites

- PostgreSQL database with `job_portal` database
- Python backend running
- Skills table populated with data

## Setup Steps

### 1. Install Python Dependencies

Make sure `python-Levenshtein` is installed:

```bash
cd backend
pip install python-Levenshtein
```

Or add to `requirements.txt`:
```
python-Levenshtein==0.21.1
```

### 2. Verify Table Exists

Since you already have the `skill_aliases` table, just verify it:

```sql
-- Connect to database
psql -U postgres -d job_portal

-- Check table structure
\d skill_aliases

-- View some sample data
SELECT sa.id, sa.alias, s.name as skill_name
FROM skill_aliases sa
JOIN skills s ON sa.skill_id = s.id
LIMIT 10;

-- Count total aliases
SELECT COUNT(*) as total_aliases FROM skill_aliases;

-- Exit
\q
```

Expected output should show:
- Table with columns: `id`, `skill_id`, `alias`
- Sample aliases like js → JavaScript, reactjs → React, etc.
- Your existing alias data

### 4. Restart Backend Server

The backend should work with your existing table. Just restart it:

```bash
cd backend

# If using uvicorn directly
uvicorn app.main:app --reload --port 8000

# Or activate venv first
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 5. Test the Endpoint

Create a test resume PDF with skills like:
- Python
- js (should match JavaScript)
- reactjs (should match React)
- postgre (should match PostgreSQL via Levenshtein)

Then test:

```bash
curl -X POST http://localhost:8000/resume/upload \
  -F "file=@test_resume.pdf"
```

Expected response:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "education": "Bachelor of CS",
  "portfolio": ["https://github.com/johndoe"],
  "projects": [],
  "skills": [
    {"id": 1, "name": "Python"},
    {"id": 5, "name": "JavaScript"},
    {"id": 12, "name": "React"},
    {"id": 23, "name": "PostgreSQL"}
  ]
}
```

### 6. Test Frontend Integration

1. Start the frontend:
   ```bash
   cd frontend  # or root directory if React is in root
   npm run dev
   ```

2. Navigate to registration page: `http://localhost:5173/register`

3. Click "Upload Resume" and select a PDF

4. Watch the form auto-fill with extracted data

5. Verify skills appear in the skill selector

6. Edit if needed and submit registration

## Troubleshooting

### Error: `relation "skill_aliases" does not exist`

**Solution:** Run the SQL script to create the table (Step 2)

### Error: `No module named 'Levenshtein'`

**Solution:** Install the library (Step 1)
```bash
pip install python-Levenshtein
```

### Error: Skills not matching

**Solution:** Check if skills exist in database:
```sql
SELECT * FROM skills WHERE LOWER(name) LIKE '%python%';
```

If missing, add them:
```sql
INSERT INTO skills (name, category) VALUES ('Python', 'Programming Language');
```

### Error: CORS error in frontend

**Solution:** Make sure backend allows frontend origin in `main.py`:
```python
allow_origins=[
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # Alternative
]
```

## Adding More Aliases

To add more skill aliases for better matching:

```sql
-- Template
INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'alias_name' FROM skills WHERE name = 'Skill Name'
ON CONFLICT (alias) DO NOTHING;

-- Examples
INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'django' FROM skills WHERE name = 'Django'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'fastapi' FROM skills WHERE name = 'FastAPI'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'k8s' FROM skills WHERE name = 'Kubernetes'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO skill_aliases (skill_id, alias) 
SELECT id, 'aws' FROM skills WHERE name = 'Amazon Web Services'
ON CONFLICT (alias) DO NOTHING;
```

## File Checklist

Make sure these files exist:

- ✅ `backend/app/models/skill_alias.py`
- ✅ `backend/app/algorithms/skill_matching.py`
- ✅ `backend/app/repositories/skill_matching_repository.py`
- ✅ `backend/app/services/resume_service.py` (updated)
- ✅ `backend/app/routers/resume.py` (updated)
- ✅ `backend/app/schemas/resume.py` (updated)
- ✅ `backend/create_skill_aliases_table.sql`
- ✅ `src/services/auth.js` (updated with uploadResume)
- ✅ `src/pages/public/Register.jsx` (updated with auto-fill)

## Next Steps

After setup is complete:

1. ✅ Test resume upload with various skill formats
2. ✅ Add more skill aliases based on your needs
3. ✅ Monitor which skills are not matching and add aliases
4. ✅ Test full registration flow (upload → auto-fill → edit → submit)
5. ✅ Verify data is saved correctly in database

## Support

For detailed documentation, see: `RESUME_SKILL_MATCHING.md`

For API details, visit: `http://localhost:8000/docs` (FastAPI auto-generated docs)
