# Frontend-Backend Integration Guide

## Overview

This document describes the integration between the React frontend and FastAPI backend for the Job Portal application.

## Backend API Endpoints

### 1. GET /skills
Returns all available skills from the database.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Python",
    "category": "Programming Languages",
    "created_at": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "name": "JavaScript",
    "category": "Programming Languages",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### 2. POST /users/register
Register a new user with multipart/form-data.

**Request Format:** `multipart/form-data`

**Fields:**
- `full_name` (string, required)
- `gender` (string, required)
- `date_of_birth` (string, required, format: YYYY-MM-DD)
- `phone` (string, required)
- `email` (string, required)
- `password` (string, required)
- `address` (string, required)
- `education` (string, optional)
- `experience_years` (float, optional, default: 0)
- `desired_position` (string, optional)
- `preferred_job_type` (string, optional)
- `portfolio_link` (string, optional)
- `skill_ids` (array of integers, optional) - Send multiple times for multiple skills
- `resume` (file, optional) - PDF only
- `profile_picture` (file, optional) - JPG/JPEG/PNG only

**Success Response (200):**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "gender": "Male",
  "date_of_birth": "1995-05-15",
  "phone": "+1234567890",
  "address": "123 Main St",
  "education": "Bachelor Degree",
  "experience_years": 2.5,
  "desired_position": "Frontend Developer",
  "preferred_job_type": "Full-time",
  "portfolio_link": "https://johndoe.dev",
  "resume_url": "uploads/resumes/550e8400-e29b-41d4-a716-446655440000.pdf",
  "profile_picture_url": "uploads/profile_pictures/550e8400-e29b-41d4-a716-446655440001.jpg",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00",
  "is_active": true
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid skill IDs: [9999]"
}
```

or

```json
{
  "detail": "Invalid date format: '15-05-1995'. Expected format: YYYY-MM-DD (e.g., 1995-05-15)"
}
```

## Frontend Implementation

### Directory Structure

```
src/
├── components/
│   └── SkillSelector.jsx       # New: Searchable skill dropdown
├── pages/
│   └── public/
│       └── Register.jsx         # Updated: Now uses SkillSelector and API
├── services/
│   ├── api.js                   # New: API configuration
│   ├── auth.js                  # New: Authentication services
│   └── skills.js                # New: Skills fetching service
└── styles/
    ├── Auth.css                 # Updated: Added error & hint styles
    └── SkillSelector.css        # New: Skill selector styling
```

### Components

#### SkillSelector Component

Located at: `src/components/SkillSelector.jsx`

**Props:**
- `availableSkills` (Array) - List of skill objects from backend `[{id, name, category}, ...]`
- `selectedSkills` (Array) - Currently selected skills
- `onChange` (Function) - Callback when selection changes
- `required` (Boolean) - Whether at least one skill is required

**Features:**
- Searchable dropdown
- Only shows unselected skills
- Displays skill name and category
- Allows removing selected skills
- Similar to PostJob skills section

**Usage:**
```jsx
import SkillSelector from "../../components/SkillSelector";

<SkillSelector
  availableSkills={availableSkills}
  selectedSkills={selectedSkills}
  onChange={setSelectedSkills}
  required={true}
/>
```

### Services

#### API Service (`src/services/api.js`)

Base configuration for API calls.

```javascript
const API_BASE_URL = 'http://localhost:8000';
export { API_BASE_URL };
```

#### Auth Service (`src/services/auth.js`)

Handles user authentication and registration.

```javascript
import { registerUser, loginUser } from '../services/auth';

// Register user
const userData = await registerUser(formData); // FormData object

// Login user
const loginData = await loginUser(email, password);
```

#### Skills Service (`src/services/skills.js`)

Handles skills fetching.

```javascript
import { fetchSkills } from '../services/skills';

const skills = await fetchSkills();
```

### Updated Register Page

**Key Changes:**

1. **Replaced SkillCapsules with SkillSelector**
   - Old: Free-text input, comma-separated
   - New: Searchable dropdown with predefined skills

2. **Integrated Backend API**
   - Fetches skills on component mount
   - Sends FormData to backend on submit
   - Handles loading and error states

3. **Field Name Mapping**
   ```javascript
   Frontend         →  Backend
   ───────────────────────────────
   fullName         →  full_name
   dateOfBirth      →  date_of_birth
   phoneNumber      →  phone
   experienceYears  →  experience_years
   desiredPosition  →  desired_position
   preferredJobType →  preferred_job_type
   portfolioLink    →  portfolio_link
   selectedSkills   →  skill_ids (array of IDs)
   resumePdf        →  resume (file)
   profilePicture   →  profile_picture (file)
   ```

4. **Skill IDs Handling**
   ```javascript
   // Send skill IDs to backend
   selectedSkills.forEach(skill => {
     formData.append("skill_ids", skill.id);
   });
   ```

## Testing the Integration

### 1. Start Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

Backend should be running at `http://localhost:8000`

### 2. Start Frontend Server

```bash
npm run dev
```

Frontend should be running at `http://localhost:5173` (or configured port)

### 3. Test Registration Flow

1. Navigate to `/register`
2. Skills should load automatically from backend
3. Fill in all required fields
4. Select skills from searchable dropdown
5. Upload resume (PDF) and profile picture (optional)
6. Submit form
7. Check backend logs for incoming request
8. Check database for new user record

### 4. Verify Skills Insertion

After registration, check database:

```sql
-- Check the new user
SELECT * FROM users ORDER BY id DESC LIMIT 1;

-- Check their skills
SELECT 
  us.id,
  u.full_name,
  s.name as skill_name
FROM user_skills us
JOIN users u ON us.user_id = u.id
JOIN skills s ON us.skill_id = s.id
WHERE u.id = <user_id>;
```

## Troubleshooting

### Issue: Skills not loading

**Check:**
1. Backend server is running
2. `/skills` endpoint returns data
3. CORS is configured properly
4. Browser console for errors

**Fix:**
```bash
# Test backend endpoint
curl http://localhost:8000/skills
```

### Issue: Registration fails with 400 error

**Common Causes:**
1. Invalid date format - Must be YYYY-MM-DD
2. Invalid skill IDs - Skills must exist in database
3. Missing required fields

**Check backend logs:**
Look for error details in the FastAPI console output.

### Issue: CORS errors

If you see CORS errors in browser console, add CORS middleware to backend:

```python
# In app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Files not uploading

**Check:**
1. File size limits (Resume: 10MB, Profile Pic: 5MB)
2. File types (Resume: PDF only, Profile: JPG/JPEG/PNG)
3. FormData is being sent correctly (don't set Content-Type header manually)

### Issue: Skills database is empty

Populate skills using the SQL script:

```bash
psql -U postgres -d job_portal -f backend/populate_skills.sql
```

## Data Flow

### Registration Flow

```
1. User fills registration form
                ↓
2. Frontend fetches skills from GET /skills
                ↓
3. User selects skills from dropdown
                ↓
4. User submits form
                ↓
5. Frontend builds FormData with:
   - All form fields (mapped to backend names)
   - Skill IDs (array)
   - Files (resume, profile_picture)
                ↓
6. Frontend sends POST /users/register
                ↓
7. Backend validates data
                ↓
8. Backend saves files to disk
                ↓
9. Backend creates user record
                ↓
10. Backend inserts user_skills records
                ↓
11. Backend returns user data
                ↓
12. Frontend stores user in context
                ↓
13. Frontend redirects to dashboard
```

## API Request Examples

### JavaScript Fetch API

```javascript
// Registration
const formData = new FormData();
formData.append("full_name", "John Doe");
formData.append("email", "john@example.com");
formData.append("password", "password123");
formData.append("date_of_birth", "1995-05-15");
formData.append("phone", "+1234567890");
formData.append("gender", "Male");
formData.append("address", "123 Main St");
formData.append("skill_ids", 1);
formData.append("skill_ids", 2);

const response = await fetch('http://localhost:8000/users/register', {
  method: 'POST',
  body: formData,
  // Don't set Content-Type - browser will set it with boundary
});

const userData = await response.json();
```

### cURL

```bash
# Registration
curl -X POST "http://localhost:8000/users/register" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "date_of_birth=1995-05-15" \
  -F "phone=+1234567890" \
  -F "gender=Male" \
  -F "address=123 Main St" \
  -F "skill_ids=1" \
  -F "skill_ids=2" \
  -F "resume=@/path/to/resume.pdf" \
  -F "profile_picture=@/path/to/photo.jpg"
```

## Environment Configuration

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:8000
```

Then update `src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Backend (.env)

```
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_portal
```

## Next Steps

1. ✅ Implement login page with backend integration
2. ⏭️ Add authentication token to requests
3. ⏭️ Create protected routes
4. ⏭️ Implement profile editing
5. ⏭️ Add file serving for uploaded resumes/pictures
6. ⏭️ Implement job posting with backend integration

## Summary

✅ Backend `/skills` endpoint created  
✅ Backend `/users/register` endpoint working  
✅ Frontend `SkillSelector` component created  
✅ Frontend registration page updated  
✅ Services for API calls created  
✅ Skills fetched from backend  
✅ Skill IDs sent to backend  
✅ Files uploaded correctly  
✅ Error handling implemented  
✅ Loading states added  

The frontend and backend are now fully integrated for user registration with skill selection!
