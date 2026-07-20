# Login - Quick Start Guide

## Endpoint

```
POST /auth/login
```

## Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Success Response (200)

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

## Error Responses

| Status | Message | Reason |
|--------|---------|--------|
| 401 | "Invalid email or password" | Wrong email or password |
| 403 | "Account has been disabled" | User is_active = false |
| 422 | Validation error | Invalid email format or missing fields |

## Quick Test

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

## Frontend Example

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};
```

## Using the Token

For authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Run Tests

```bash
python test_login.py
```

## Files Created

- ✅ `app/routers/auth.py` - Login endpoint
- ✅ `app/services/auth_service.py` - Login logic
- ✅ `app/schemas/auth.py` - Request/response schemas
- ✅ `app/core/security.py` - JWT functions (added)

## Key Features

✅ Email/password authentication  
✅ JWT tokens (24 hour expiry)  
✅ Account status validation  
✅ Secure password verification  
✅ Generic error messages (security)  
✅ Returns only necessary user data  

## Important Notes

1. **Security:** Same error message for wrong email or password
2. **Token:** Valid for 24 hours
3. **Minimal Data:** Response contains only essential user info
4. **Production:** Change SECRET_KEY in `app/core/security.py`
