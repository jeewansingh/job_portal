# Install and Test Login Feature

## Step 1: Install New Dependency

```bash
cd backend
pip install email-validator
```

Or install from requirements:
```bash
pip install -r requirements.txt
```

## Step 2: Verify Installation

Check that python-jose is installed (should already be there):
```bash
python -c "from jose import jwt; print('✓ python-jose installed')"
```

Check email-validator:
```bash
python -c "from email_validator import validate_email; print('✓ email-validator installed')"
```

## Step 3: Start Backend Server

```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment if not already active
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Run server
uvicorn app.main:app --reload
```

## Step 4: Verify Endpoint is Available

Open browser and go to:
```
http://localhost:8000/docs
```

You should see the new **POST /auth/login** endpoint under the "Authentication" section.

## Step 5: Test Login

### Option 1: Using the test script

```bash
python test_login.py
```

**Before running:** Update the email/password in the script to match a real user in your database.

### Option 2: Using cURL

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-user@example.com",
    "password": "your-password"
  }'
```

### Option 3: Using Swagger UI

1. Go to http://localhost:8000/docs
2. Find POST /auth/login
3. Click "Try it out"
4. Enter email and password
5. Click "Execute"

## Step 6: Expected Response

**Success (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "User Name",
    "email": "user@example.com",
    "profile_picture_url": null,
    "preferred_job_type": "Full-time"
  }
}
```

**Wrong credentials (401):**
```json
{
  "detail": "Invalid email or password"
}
```

**Disabled account (403):**
```json
{
  "detail": "Account has been disabled"
}
```

## Troubleshooting

### Issue: ModuleNotFoundError: No module named 'jose'

**Solution:**
```bash
pip install python-jose
```

### Issue: ModuleNotFoundError: No module named 'email_validator'

**Solution:**
```bash
pip install email-validator
```

### Issue: "Invalid email or password" but credentials are correct

**Check user exists:**
```sql
SELECT id, email, is_active FROM users WHERE email = 'your-email@example.com';
```

**Check password by trying to login with a newly registered user.**

### Issue: ImportError: cannot import name 'jwt'

This means python-jose is not installed or is the wrong version.

**Solution:**
```bash
pip uninstall python-jose
pip install python-jose==3.5.0
```

## Quick Verification

Run this Python snippet to verify everything works:

```python
# test_quick.py
from app.core.security import create_access_token, verify_password, hash_password

# Test password hashing
password = "test123"
hashed = hash_password(password)
print(f"✓ Password hashed: {hashed[:20]}...")

# Test password verification
is_valid = verify_password(password, hashed)
print(f"✓ Password verification: {is_valid}")

# Test JWT creation
token = create_access_token({"user_id": 1, "email": "test@example.com"})
print(f"✓ JWT token created: {token[:50]}...")

print("\n✅ All security functions working!")
```

Run it:
```bash
python test_quick.py
```

## Success Criteria

✅ Server starts without errors  
✅ /docs shows POST /auth/login endpoint  
✅ Test login returns access token  
✅ Invalid credentials return 401  
✅ Token contains user_id and email  

## Next: Frontend Integration

Once backend is working, integrate with frontend:

1. Create login form
2. POST to /auth/login
3. Store access_token in localStorage
4. Use token for authenticated requests:
   ```
   Authorization: Bearer <access_token>
   ```

## Need Help?

Check the documentation:
- Full documentation: `LOGIN_IMPLEMENTATION.md`
- Quick reference: `LOGIN_QUICK_START.md`
- Summary: `LOGIN_SUMMARY.md`
