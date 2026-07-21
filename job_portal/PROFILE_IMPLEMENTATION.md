# User Profile Feature Implementation

## Backend Implementation

### 1. Database Layer (Repositories)

**`repositories/user_repository.py`** - Added:
- `update(db, user)` - Update user record in database

**`repositories/user_skill_repository.py`** - Added:
- `delete_by_user_id(db, user_id)` - Delete all skills for a user

### 2. Schema Layer

**`schemas/user.py`** - Added:
- `SkillDetail` - Schema for skill with id and name
- `UserProfileResponse` - Extended user response with skills list
- `from_orm_with_skills()` - Static method to convert User ORM to response with skills

### 3. Service Layer

**`services/user_service.py`** - Added:
- `get_user_profile(db, user_id)` - Get user profile with skills
- `update_user_profile(db, user_id, ...)` - Update user profile including skills and files

### 4. Router Layer

**`routers/users.py`** - Added:
- `GET /users/{user_id}/profile` - Get user profile with skills
- `PUT /users/{user_id}/profile` - Update user profile (multipart/form-data)

## Frontend Implementation

### 1. Service Layer

**`services/profile.js`** - Created:
- `getUserProfile(userId)` - Fetch user profile from backend
- `updateUserProfile(userId, formData)` - Update user profile with files

### 2. Component Layer

**`pages/user/Profile.jsx`** - Updated:
- Fetch profile data from backend on mount
- Convert backend snake_case to frontend camelCase
- Use SkillSelector component for skill selection
- Send FormData with skill IDs to backend
- Handle file uploads (resume PDF, profile picture)
- Loading and error states
- Real-time profile updates

## API Endpoints

### Get User Profile
```
GET /users/{user_id}/profile
```

**Response:**
```json
{
  "id": 1,
  "full_name": "Jeewan Singh",
  "gender": "Male",
  "date_of_birth": "1995-05-15",
  "phone": "+1234567890",
  "email": "jeewan@gmail.com",
  "address": "123 Main St",
  "education": "Bachelor's in Computer Science",
  "experience_years": 3.5,
  "desired_position": "Full Stack Developer",
  "preferred_job_type": "Full-time",
  "portfolio_link": "https://portfolio.com",
  "resume_url": "/uploads/resumes/resume_123.pdf",
  "profile_picture_url": "/uploads/profile_pictures/pic_123.jpg",
  "skills": [
    { "id": 1, "name": "Python" },
    { "id": 5, "name": "React" }
  ],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-20T15:45:00",
  "is_active": true
}
```

### Update User Profile
```
PUT /users/{user_id}/profile
Content-Type: multipart/form-data
```

**Form Data:**
- `full_name` (string, required)
- `gender` (string, required)
- `date_of_birth` (string YYYY-MM-DD, required)
- `phone` (string, required)
- `address` (string, required)
- `education` (string, optional)
- `experience_years` (float, optional)
- `desired_position` (string, optional)
- `preferred_job_type` (string, optional)
- `portfolio_link` (string, optional)
- `skill_ids` (int[], optional) - Array of skill IDs
- `resume` (file, optional) - PDF only
- `profile_picture` (file, optional) - JPG/JPEG/PNG only

**Response:** Same as GET profile

## Data Flow

### Loading Profile:
1. User opens profile page
2. Frontend gets user ID from localStorage
3. Calls `GET /users/{user_id}/profile`
4. Backend fetches user with skills via SQLAlchemy relationships
5. Converts to UserProfileResponse with skills
6. Frontend receives data and updates UI

### Updating Profile:
1. User edits profile and clicks Save
2. Frontend creates FormData with all fields
3. Adds skill IDs as integers
4. Adds files if changed
5. Calls `PUT /users/{user_id}/profile`
6. Backend validates and updates user
7. Updates skills (delete old, insert new)
8. Saves files if provided
9. Returns updated profile
10. Frontend updates context and UI

## Field Mapping

### Backend → Frontend
- `full_name` → `fullName`
- `date_of_birth` → `dateOfBirth`
- `phone` → `phoneNumber`
- `experience_years` → `experienceYears`
- `desired_position` → `desiredPosition`
- `preferred_job_type` → `preferredJobTypes[]`
- `portfolio_link` → `portfolioLink`
- `profile_picture_url` → `profilePictureUrl`
- `skills[].name` → `skills[]` (for context)

### Frontend → Backend
- Reverse of above mapping
- Skills sent as `skill_ids[]` (integers)

## Features

✅ Fetch real profile data from database
✅ Display skills from backend
✅ Edit all profile fields
✅ Update skills with searchable dropdown
✅ Upload/replace resume (PDF)
✅ Upload/replace profile picture (images)
✅ Loading states
✅ Error handling
✅ Auto-save to database
✅ Update UserContext after save
✅ Profile completion ring updates

## Testing

### Backend:
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test get profile
curl http://localhost:8000/users/1/profile

# Test update profile (use Postman for multipart)
```

### Frontend:
1. Login as a user
2. Navigate to Profile page
3. Verify data loads from backend
4. Click Edit Profile
5. Modify fields and skills
6. Upload new files
7. Click Save Changes
8. Verify data updates in database
9. Check profile picture appears in navbar
10. Check name appears correctly
