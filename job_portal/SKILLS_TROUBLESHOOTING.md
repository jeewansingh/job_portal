# Skills Not Appearing - Troubleshooting Guide

## Issue: Skills dropdown is empty in registration page

### Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:8000/skills
```

**Expected:** JSON array of skills

**If fails:** Backend is not running or endpoint not working

### Step 2: Test Skills Endpoint

Run the test script:
```bash
cd backend
python test_skills_endpoint.py
```

Or open the HTML test file:
```bash
open test_skills_api.html
# Or manually open in browser: file:///.../test_skills_api.html
```

### Step 3: Check Skills in Database

```sql
-- Check if skills exist
SELECT COUNT(*) FROM skills;

-- View some skills
SELECT id, name, category FROM skills LIMIT 10;
```

**If empty:** Populate skills table
```bash
psql -U postgres -d job_portal -f backend/populate_skills.sql
```

### Step 4: Check CORS Configuration

If skills endpoint works with cURL but not from browser, it's a CORS issue.

**Fix:** Add CORS middleware to `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Then add your routers
app.include_router(auth_router)
# ...
```

### Step 5: Check Frontend Console

Open browser console (F12) and check for errors when loading /register page.

**Expected logs:**
```
Fetching skills from backend...
Skills fetched successfully: [{id: 1, name: "Python", ...}, ...]
```

**If error:** Check the error message

### Step 6: Verify API URL

Check `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

Make sure it matches where your backend is running.

### Step 7: Test Skills Fetch Function

Open browser console on /register page and run:
```javascript
fetch('http://localhost:8000/skills')
  .then(r => r.json())
  .then(skills => console.log('Skills:', skills))
  .catch(err => console.error('Error:', err));
```

## Common Issues & Solutions

### Issue: "NetworkError" or "Failed to fetch"

**Cause:** Backend not running or wrong URL

**Solution:**
1. Start backend: `uvicorn app.main:app --reload`
2. Verify URL in `src/services/api.js`

### Issue: CORS error in browser console

**Symptom:**
```
Access to fetch at 'http://localhost:8000/skills' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:** Add CORS middleware (see Step 4 above)

### Issue: Skills endpoint returns 404

**Cause:** Router not registered or endpoint path wrong

**Solution:** Check `backend/app/main.py`:
```python
from app.routers.skills import router as skill_router
app.include_router(skill_router)
```

### Issue: Empty skills array returned

**Cause:** Skills table is empty

**Solution:** Populate skills:
```bash
psql -U postgres -d job_portal -f backend/populate_skills.sql
```

### Issue: Skills load but dropdown doesn't appear

**Cause:** CSS or component issue

**Solution:**
1. Check if `SkillSelector.css` is imported
2. Check browser console for React errors
3. Check if `availableSkills` has data:
   ```javascript
   console.log('Available skills:', availableSkills);
   ```

## Quick Checks

✅ Backend running on http://localhost:8000  
✅ Frontend running on http://localhost:5173  
✅ Skills table has data  
✅ CORS configured  
✅ Skills router registered  
✅ API_BASE_URL is correct  
✅ No console errors  

## Testing Commands

### Test backend directly
```bash
curl http://localhost:8000/skills
```

### Test with headers
```bash
curl -H "Origin: http://localhost:5173" -v http://localhost:8000/skills
```

### Check database
```sql
SELECT * FROM skills LIMIT 5;
```

### Test from browser
```javascript
// In browser console on /register page
fetch('http://localhost:8000/skills')
  .then(r => r.json())
  .then(console.log);
```

## Still Not Working?

1. **Restart both servers**
   ```bash
   # Kill both servers (Ctrl+C)
   # Start backend
   cd backend && uvicorn app.main:app --reload
   # Start frontend
   npm run dev
   ```

2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)

3. **Check all logs:**
   - Backend terminal output
   - Frontend terminal output  
   - Browser console (F12)

4. **Verify file changes were saved:**
   - `backend/app/routers/skills.py`
   - `backend/app/main.py` (router registered)
   - `src/services/skills.js`
   - `src/components/SkillSelector.jsx`

## Debug Information to Collect

If still having issues, collect this information:

1. **Backend test result:**
   ```bash
   python backend/test_skills_endpoint.py
   ```

2. **cURL response:**
   ```bash
   curl -v http://localhost:8000/skills
   ```

3. **Browser console errors:**
   - Open /register page
   - Press F12
   - Copy any errors

4. **Network tab:**
   - Open /register page
   - Press F12 → Network tab
   - Refresh page
   - Check if /skills request appears
   - Check its status and response

5. **Database check:**
   ```sql
   SELECT COUNT(*) FROM skills;
   SELECT * FROM skills LIMIT 3;
   ```

Share these outputs for further debugging.
