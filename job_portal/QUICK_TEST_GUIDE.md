# Quick Test Guide

## Prerequisites

✅ PostgreSQL running  
✅ Skills table populated  
✅ Backend dependencies installed  
✅ Frontend dependencies installed  

## 1. Start Backend

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

## 2. Test Backend Endpoints

### Test Skills Endpoint

```bash
curl http://localhost:8000/skills
```

Expected: JSON array of skills

### Test Docs

Open: http://localhost:8000/docs

You should see:
- GET /skills
- POST /users/register
- POST /auth/login

## 3. Start Frontend

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 4. Test Registration

1. Open http://localhost:5173/register

2. Check browser console - should see skills loading

3. Fill the form:
   - **Full Name:** Test User
   - **Gender:** Male
   - **Date of Birth:** 1995-05-15
   - **Phone:** +1234567890
   - **Email:** test@example.com
   - **Address:** 123 Test St
   - **Skills:** Search and select 2-3 skills
   - **Password:** Test123!
   - **Confirm Password:** Test123!
   - ✅ Agree to terms

4. Click "Create Account"

5. Check browser console for:
   - Success message or
   - Error message

## 5. Verify in Database

```sql
-- Check the new user
SELECT id, full_name, email FROM users ORDER BY id DESC LIMIT 1;

-- Check their skills (replace <user_id>)
SELECT 
  u.full_name,
  s.name as skill_name
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
WHERE u.id = <user_id>;
```

Expected: User record + skill associations

## Troubleshooting

### "Failed to fetch skills"

**Check:**
- Backend is running
- Skills table has data

**Fix:**
```bash
psql -U postgres -d job_portal -f backend/populate_skills.sql
```

### CORS Error

**Error:** "Access to fetch blocked by CORS policy"

**Fix:** Add to `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### "Invalid skill IDs"

**Check:** Skills exist in database
```sql
SELECT id, name FROM skills WHERE id IN (1, 2, 3);
```

### Registration hangs

**Check:**
- Backend console for errors
- Browser network tab
- Browser console for errors

## Quick Checks

### Backend Health
```bash
curl http://localhost:8000/skills | jq .
```

### Frontend Running
Open http://localhost:5173 - should load

### Skills Dropdown Works
1. Go to /register
2. Click in skills field
3. Dropdown should appear with skills

### FormData Sent Correctly
1. Fill form and submit
2. Open browser DevTools → Network tab
3. Find the POST request to /users/register
4. Check "Payload" - should show all fields

## Success Criteria

✅ Skills load from backend  
✅ Skill dropdown appears and is searchable  
✅ Can select multiple skills  
✅ Can remove selected skills  
✅ Form submits without errors  
✅ User created in database  
✅ Skills associated with user  

## Next Steps

1. ✅ Test login functionality
2. ✅ Test with actual resume PDF
3. ✅ Test with profile picture
4. ✅ Test validation errors
5. ✅ Test with all fields filled

## Need Help?

Check the documentation:
- `FRONTEND_BACKEND_INTEGRATION.md` - Full integration guide
- `INTEGRATION_SUMMARY.md` - Quick reference
- `LOGIN_IMPLEMENTATION.md` - Login details
