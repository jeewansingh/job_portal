# Login Implementation Documentation

## Overview

A clean, production-ready email/password login system with JWT authentication has been implemented following the existing project architecture.

## Endpoint

### POST /auth/login

Authenticate user and return access token.

**Request:**
- Method: POST
- Content-Type: application/json
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "userpassword"
  }
  ```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "Jeewan Singh",
    "email": "jeewan@gmail.com",
    "profile_picture_url": "uploads/profile_pictures/user_1.jpg",
    "preferred_job_type": "Full-time"
  }
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials:
```json
{
  "detail": "Invalid email or password"
}
```

**403 Forbidden** - Account disabled:
```json
{
  "detail": "Account has been disabled"
}
```

**422 Unprocessable Entity** - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

## Architecture

### Files Created/Modified

#### 1. `app/core/security.py` (Modified)
Added JWT token generation and verification:
- `create_access_token()` - Generate JWT tokens
- `verify_access_token()` - Verify and decode tokens
- Token expiration: 24 hours
- Algorithm: HS256

#### 2. `app/schemas/auth.py` (New)
Pydantic schemas for authentication:
- `LoginRequest` - Login credentials
- `UserBasicInfo` - User info returned after login
- `LoginResponse` - Complete login response

#### 3. `app/services/auth_service.py` (New)
Business logic for authentication:
- `login_user()` - Complete login flow
- Email validation
- Password verification
- Account status check
- Token generation

#### 4. `app/routers/auth.py` (New)
API endpoint:
- `POST /auth/login` - Login endpoint
- Handles request/response
- Returns proper HTTP status codes

#### 5. `app/main.py` (Modified)
Registered auth router

#### 6. `app/repositories/user_repository.py` (No changes)
Already had required `get_by_email()` method

## Login Flow

```
1. Client sends POST /auth/login with email and password
                    ↓
2. Router validates request body format
                    ↓
3. Service calls UserRepository.get_by_email()
                    ↓
4. If user not found → HTTP 401 "Invalid email or password"
                    ↓
5. If user found → Verify password using bcrypt
                    ↓
6. If password wrong → HTTP 401 "Invalid email or password"
                    ↓
7. If password correct → Check is_active flag
                    ↓
8. If is_active=False → HTTP 403 "Account has been disabled"
                    ↓
9. If is_active=True → Generate JWT token
                    ↓
10. Return access token + basic user info
```

## Security Features

### 1. Password Security
- Uses bcrypt for password hashing
- Password verification via existing `verify_password()` function
- Never reveals whether email or password was incorrect

### 2. JWT Security
- Tokens expire after 24 hours
- Contains minimal claims (user_id, email)
- Uses HS256 algorithm
- Secret key configurable (move to environment variables in production)

### 3. Account Security
- Checks `is_active` flag before allowing login
- Returns specific error for disabled accounts
- Generic error message for invalid credentials

### 4. Input Validation
- Email format validated by Pydantic
- Required fields enforced
- Returns 422 for validation errors

## Usage Examples

### Python Requests

```python
import requests

# Successful login
response = requests.post(
    "http://localhost:8000/auth/login",
    json={
        "email": "user@example.com",
        "password": "password123"
    }
)

if response.status_code == 200:
    data = response.json()
    access_token = data["access_token"]
    user_info = data["user"]
    print(f"Logged in as: {user_info['full_name']}")
else:
    print(f"Login failed: {response.json()['detail']}")
```

### JavaScript/Fetch

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store token
    localStorage.setItem('access_token', data.access_token);
    // Store user info
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    const error = await response.json();
    throw new Error(error.detail);
  }
};

// Usage
try {
  const result = await login('user@example.com', 'password123');
  console.log('Logged in:', result.user.full_name);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### cURL

```bash
# Successful login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "profile_picture_url": null,
    "preferred_job_type": "Full-time"
  }
}
```

## Testing

### Automated Tests

Run the test script:
```bash
cd backend
python test_login.py
```

The test script covers:
1. Successful login
2. Invalid email
3. Invalid password
4. Missing fields
5. Invalid email format

### Manual Testing

1. **Successful Login:**
   ```bash
   curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "existing@user.com", "password": "correctpassword"}'
   ```

2. **Invalid Credentials:**
   ```bash
   curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "wrong@email.com", "password": "wrongpass"}'
   ```

3. **Disabled Account:**
   First, disable a user in the database:
   ```sql
   UPDATE users SET is_active = false WHERE email = 'test@user.com';
   ```
   Then try to login with that user.

## JWT Token Structure

### Payload
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "exp": 1704067200
}
```

### Claims Explanation
- `user_id`: Database ID of the user
- `email`: User's email address
- `exp`: Expiration timestamp (24 hours from creation)

### Using the Token

Include in Authorization header for protected endpoints:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Requirements

No database changes required. Uses existing `users` table:
- `email` - For user lookup
- `password_hash` - For password verification
- `is_active` - For account status check
- `id`, `full_name`, `profile_picture_url`, `preferred_job_type` - Returned in response

## Configuration

### JWT Secret Key

**Current (Development):**
```python
SECRET_KEY = "your-secret-key-here-change-in-production"
```

**Production Setup:**

1. Create `.env` file:
   ```
   SECRET_KEY=your-super-secret-random-key-min-32-chars
   ```

2. Install python-dotenv:
   ```bash
   pip install python-dotenv
   ```

3. Update `app/core/security.py`:
   ```python
   from dotenv import load_dotenv
   import os
   
   load_dotenv()
   SECRET_KEY = os.getenv("SECRET_KEY")
   ```

### Token Expiration

Default: 24 hours

To change:
```python
# In app/core/security.py
ACCESS_TOKEN_EXPIRE_HOURS = 48  # 2 days
```

## Error Handling

### Generic Error Message
For security, the same error message is returned for:
- Non-existent email
- Wrong password

This prevents attackers from determining if an email exists in the system.

### Specific Error for Disabled Accounts
Disabled accounts get a specific error (403) to inform legitimate users that their account has been disabled, not that their credentials are wrong.

## Security Best Practices Implemented

✅ Password hashing with bcrypt  
✅ Generic error messages for failed login  
✅ Account status validation  
✅ JWT token expiration  
✅ Email format validation  
✅ No sensitive data in token payload  
✅ No sensitive data in response (no password_hash, address, phone, etc.)  
✅ Separation of concerns (router → service → repository)  

## Not Implemented (As Requested)

❌ Refresh tokens  
❌ Logout endpoint  
❌ Forgot password  
❌ Email verification  
❌ OAuth/Social login  
❌ Role-based authentication  
❌ Rate limiting  
❌ Password reset  

These can be added later as separate features.

## Next Steps

### For Frontend Integration:
1. Create login form
2. Call POST /auth/login with email/password
3. Store `access_token` in localStorage or cookie
4. Store `user` object for display
5. Add Authorization header to protected API calls

### For Backend:
1. Move SECRET_KEY to environment variable
2. Create middleware to verify JWT tokens
3. Add authentication dependency for protected endpoints
4. Implement token refresh mechanism (optional)
5. Add rate limiting to prevent brute force attacks

## Troubleshooting

### Issue: "Invalid email or password" but credentials are correct

**Check:**
1. User exists in database:
   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

2. Password hash is correct:
   ```python
   from app.core.security import verify_password
   # Compare entered password with stored hash
   ```

3. User is active:
   ```sql
   SELECT is_active FROM users WHERE email = 'user@example.com';
   ```

### Issue: Token verification fails

**Check:**
1. Token hasn't expired (24 hour limit)
2. SECRET_KEY matches between token creation and verification
3. Token is properly formatted in Authorization header

### Issue: "Account has been disabled"

This means `is_active = false` in the database. To re-enable:
```sql
UPDATE users SET is_active = true WHERE email = 'user@example.com';
```

## API Documentation

FastAPI automatically generates interactive API docs:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Access these URLs to test the login endpoint interactively.
