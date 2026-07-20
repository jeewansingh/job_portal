# File Upload Documentation

## Overview

This document describes the file upload functionality integrated into the user registration process in the Job Portal application.

## Architecture

File uploads (resume and profile picture) are now part of the user registration workflow. When a new user registers, they can optionally include a resume and profile picture along with their profile information.

## Registration Endpoint

### POST /users/register

Register a new user with profile information, resume, and profile picture.

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | Yes | User's full name |
| gender | string | Yes | User's gender |
| date_of_birth | string | Yes | Date of birth (YYYY-MM-DD) |
| phone | string | Yes | Phone number |
| email | string | Yes | Email address |
| password | string | Yes | Password |
| address | string | Yes | User's address |
| education | string | No | Education information |
| experience_years | float | No | Years of experience (default: 0) |
| desired_position | string | No | Desired job position |
| preferred_job_type | string | No | Preferred job type |
| portfolio_link | string | No | Portfolio URL |
| skills | array[string] | No | List of skill names |
| resume | file | No | Resume PDF file |
| profile_picture | file | No | Profile picture (JPG/JPEG/PNG) |

**Resume Specifications:**
- Accepted format: PDF only
- Maximum file size: 10MB
- Storage location: `uploads/resumes/`
- File naming: UUID-based unique filename
- Stored in database: Relative file path in `users.resume_url`

**Profile Picture Specifications:**
- Accepted formats: JPG, JPEG, PNG
- Maximum file size: 5MB
- Storage location: `uploads/profile_pictures/`
- File naming: UUID-based unique filename
- Stored in database: Relative file path in `users.profile_picture_url`

**Example Request (cURL):**
```bash
curl -X POST "http://localhost:8000/users/register" \
  -F "full_name=John Doe" \
  -F "gender=Male" \
  -F "date_of_birth=1995-05-15" \
  -F "phone=+1234567890" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "address=123 Main St, New York, NY" \
  -F "education=Bachelor of Computer Science" \
  -F "experience_years=3.5" \
  -F "desired_position=Full Stack Developer" \
  -F "preferred_job_type=Full-time" \
  -F "portfolio_link=https://johndoe.dev" \
  -F "skills=Python" \
  -F "skills=JavaScript" \
  -F "skills=FastAPI" \
  -F "resume=@/path/to/resume.pdf" \
  -F "profile_picture=@/path/to/photo.jpg"
```

**Example Request (Python):**
```python
import requests

data = {
    'full_name': 'John Doe',
    'gender': 'Male',
    'date_of_birth': '1995-05-15',
    'phone': '+1234567890',
    'email': 'john@example.com',
    'password': 'SecurePass123!',
    'address': '123 Main St, New York, NY',
    'education': 'Bachelor of Computer Science',
    'experience_years': 3.5,
    'desired_position': 'Full Stack Developer',
    'preferred_job_type': 'Full-time',
    'portfolio_link': 'https://johndoe.dev',
    'skills': ['Python', 'JavaScript', 'FastAPI'],
}

files = {
    'resume': ('resume.pdf', open('resume.pdf', 'rb'), 'application/pdf'),
    'profile_picture': ('photo.jpg', open('photo.jpg', 'rb'), 'image/jpeg'),
}

response = requests.post(
    'http://localhost:8000/users/register',
    data=data,
    files=files
)
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "gender": "Male",
  "date_of_birth": "1995-05-15",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St, New York, NY",
  "education": "Bachelor of Computer Science",
  "experience_years": 3.5,
  "desired_position": "Full Stack Developer",
  "preferred_job_type": "Full-time",
  "portfolio_link": "https://johndoe.dev",
  "resume_url": "uploads/resumes/550e8400-e29b-41d4-a716-446655440000.pdf",
  "profile_picture_url": "uploads/profile_pictures/550e8400-e29b-41d4-a716-446655440001.jpg",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00",
  "is_active": true
}
```

## Error Handling

### Invalid File Type - Resume

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "detail": "Invalid file type. Allowed types: application/pdf"
}
```

### Invalid File Type - Profile Picture

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "detail": "Invalid file type. Allowed types: image/jpeg, image/jpg, image/png"
}
```

### File Too Large

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "detail": "Resume too large. Maximum size: 10.0MB"
}
```

or

```json
{
  "detail": "Profile picture too large. Maximum size: 5.0MB"
}
```

### Duplicate Email

**Status Code:** 400/500 (depends on database constraints)

**Response:**
```json
{
  "detail": "Email already registered"
}
```

## Project Architecture

### File Structure

```
backend/
├── app/
│   ├── routers/
│   │   └── users.py              # Registration endpoint with file handling
│   ├── services/
│   │   └── user_service.py       # User registration business logic
│   ├── repositories/
│   │   ├── user_repository.py    # Database operations
│   │   ├── skill_repository.py   # Skill queries
│   │   └── user_skill_repository.py  # User-skill relationships
│   ├── utils/
│   │   └── file_upload.py        # File handling utilities
│   ├── schemas/
│   │   └── user.py               # UserResponse schema
│   └── models/
│       └── user.py               # User database model
└── uploads/                      # Upload directory (auto-created)
    ├── resumes/
    └── profile_pictures/
```

### Layer Responsibilities

1. **Router Layer** (`routers/users.py`)
   - Defines HTTP endpoint
   - Handles multipart/form-data requests
   - Extracts form fields and files
   - Calls service layer

2. **Service Layer** (`services/user_service.py`)
   - Implements registration business logic
   - Coordinates file saving and user creation
   - Handles skill associations
   - Manages database transactions

3. **Repository Layer** (`repositories/`)
   - Provides database access methods
   - Handles user queries and creation
   - Manages skill queries

4. **Utility Layer** (`utils/file_upload.py`)
   - Low-level file operations
   - File validation (type, size)
   - Directory management
   - UUID-based filename generation

## Registration Flow

1. Client sends multipart/form-data request with all fields
2. Router extracts Form fields and File uploads
3. Service layer receives all parameters
4. Files are validated (type and size)
5. Resume file is saved to disk (if provided)
6. Profile picture is saved to disk (if provided)
7. User object is created with file paths
8. User is saved to database
9. Skills are associated with user
10. Transaction is committed
11. Created user is returned

## File Management

### Automatic Directory Creation

Upload directories are created automatically on first use:
- `uploads/resumes/`
- `uploads/profile_pictures/`

### File Naming Convention

Files are named using UUID v4 to ensure uniqueness:
- `550e8400-e29b-41d4-a716-446655440000.pdf`
- `550e8400-e29b-41d4-a716-446655440001.jpg`

This ensures:
- No filename conflicts
- No overwrites
- Secure filenames (no user input)

### File Storage

Files are stored with relative paths in the database:
- `uploads/resumes/550e8400-e29b-41d4-a716-446655440000.pdf`
- `uploads/profile_pictures/550e8400-e29b-41d4-a716-446655440001.jpg`

## Security Considerations

1. **File Type Validation**
   - Validates MIME types before accepting files
   - Only allows specific document and image types
   - Prevents execution of malicious files

2. **File Size Limits**
   - Enforces maximum file sizes
   - Prevents DoS attacks via large uploads
   - Ensures reasonable storage usage

3. **UUID-based Naming**
   - Uses cryptographically random UUIDs
   - Prevents filename-based attacks
   - No user-controlled filenames

4. **Path Safety**
   - Uses Path objects to prevent directory traversal
   - Files stored only in designated directories
   - No relative path manipulation

5. **Password Security**
   - Passwords are hashed using bcrypt
   - Plain passwords never stored

## Database Schema

The `users` table includes:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT NOT NULL,
    education VARCHAR(150),
    experience_years DECIMAL(3,1) DEFAULT 0,
    desired_position VARCHAR(100),
    preferred_job_type VARCHAR(30),
    portfolio_link TEXT,
    resume_url TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

## Testing

A test script is provided at `backend/test_registration.py`.

**Run tests:**
```bash
# Make sure the backend server is running
cd backend
python test_registration.py
```

The test script covers:
- Full registration with both files
- Registration without files
- Invalid resume file type rejection
- Invalid profile picture file type rejection

## Future Enhancements

Potential improvements:
1. Add authentication/authorization for file access
2. Implement image resizing/optimization for profile pictures
3. Add file serving endpoints with access control
4. Implement cloud storage (S3, Azure Blob, etc.)
5. Add virus scanning for uploaded files
6. Implement rate limiting on registration endpoint
7. Add file update endpoints for existing users
8. Support multiple file formats (DOCX for resumes, WebP for images)
9. Add thumbnail generation for profile pictures
10. Implement CDN integration for file serving
