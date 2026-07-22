# Debug Steps for "Method Not Allowed" Error

## The Problem

You're getting `{"detail":"Method Not Allowed"}` when creating an account.

## Possible Causes

### 1. Resume Upload Endpoint Issue
**Symptom:** Error happens when uploading resume
**Check:**
```bash
# Open browser console and check which endpoint is failing
# Network tab should show the actual request
```

### 2. Registration Endpoint Issue  
**Symptom:** Error happens when submitting registration form
**Check:** The `/users/register` endpoint might have changed

### 3. Backend Not Restarted
**Symptom:** Old code still running
**Fix:**
```bash
cd backend
# Stop the server (Ctrl+C)
# Restart it
uvicorn app.main:app --reload --port 8000
```

## Step-by-Step Debugging

### Step 1: Check Backend is Running

```bash
# Should show FastAPI docs
curl http://localhost:8000/docs
```

If not running:
```bash
cd backend
source venv/bin/activate  # If using venv
uvicorn app.main:app --reload --port 8000
```

### Step 2: Check Resume Endpoint

Visit: http://localhost:8000/docs

Look for:
- ✓ `POST /resume/upload` - Should be in the list
- If missing, router not registered

Test it:
1. Click "POST /resume/upload"
2. Click "Try it out"  
3. Upload any PDF file
4. Click "Execute"
5. Should return JSON with name, email, phone, skills, etc.

### Step 3: Check What's Failing in Browser

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to register
4. Look for RED requests
5. Click on the failed request
6. Check:
   - **Request URL:** Which endpoint failed?
   - **Request Method:** POST, GET, etc.?
   - **Status Code:** 405, 422, 500?
   - **Response:** What error message?

### Step 4: Common Issues

#### Issue A: Resume upload fails

**Browser Console Shows:**
```
POST http://localhost:8000/resume/upload - 405 Method Not Allowed
```

**Solution:**
1. Check if `resume_router` is included in `main.py`
2. Restart backend server
3. Clear browser cache

#### Issue B: Registration fails

**Browser Console Shows:**
```
POST http://localhost:8000/users/register - 405 Method Not Allowed
```

**Solution:**
This means the registration endpoint changed. Let me check the users router.

#### Issue C: CORS error

**Browser Console Shows:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Check `main.py` has correct CORS origins:
```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### Step 5: Test Resume Upload Separately

Before full registration, test just the resume upload:

```javascript
// Open browser console on http://localhost:5173
// Paste this code:

const testResume = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Success:', data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  input.click();
};

testResume();
```

This will test resume upload independently.

## Quick Fixes

### Fix 1: Restart Everything

```bash
# Terminal 1: Backend
cd backend
# Ctrl+C to stop
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend  
# Ctrl+C to stop
npm run dev
```

### Fix 2: Check Backend Logs

When you try to register, watch the backend terminal.

**If you see:**
```
AttributeError: 'NoneType' object has no attribute...
```
→ Database connection issue or missing data

**If you see:**
```
ValueError: ... 
```
→ Data validation issue

**If you see nothing:**
→ Request not reaching backend (CORS or wrong URL)

### Fix 3: Verify API Base URL

Check `src/services/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:8000';
```

Should match where backend is running.

## Most Likely Issue

Based on your error, the most likely issue is:

**The registration endpoint expects different data format now that skills return `{id, name}` objects**

Let me check the users router...
