# Architecture Diagram: User Registration with File Uploads

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATION                          │
│                   (Web Browser / Mobile App / API Client)            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ HTTP POST /users/register
                                  │ Content-Type: multipart/form-data
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         FASTAPI APPLICATION                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ROUTER LAYER                              │   │
│  │              (app/routers/users.py)                          │   │
│  │                                                               │   │
│  │  @router.post("/register")                                   │   │
│  │  async def register(                                         │   │
│  │      full_name: Form(...),                                   │   │
│  │      email: Form(...),                                       │   │
│  │      password: Form(...),                                    │   │
│  │      ...                                                      │   │
│  │      skills: List[str] = Form([]),                           │   │
│  │      resume: UploadFile = File(None),                        │   │
│  │      profile_picture: UploadFile = File(None)                │   │
│  │  )                                                            │   │
│  └────────────────────────────┬────────────────────────────────┘   │
│                               │                                      │
│                               │ Calls                                │
│                               ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER                             │   │
│  │              (app/services/user_service.py)                  │   │
│  │                                                               │   │
│  │  async def register_user(...)                                │   │
│  │      ├─→ save_resume(resume)              ──┐               │   │
│  │      │                                       │               │   │
│  │      ├─→ save_profile_picture(picture)  ──┐ │               │   │
│  │      │                                     │ │               │   │
│  │      ├─→ Create User object               │ │               │   │
│  │      │   with file paths                  │ │               │   │
│  │      │                                     │ │               │   │
│  │      ├─→ UserRepository.create()          │ │               │   │
│  │      │                                     │ │               │   │
│  │      ├─→ Associate skills                 │ │               │   │
│  │      │                                     │ │               │   │
│  │      └─→ db.commit()                      │ │               │   │
│  └────────────────────────────┬──────────────┼─┼───────────────┘   │
│                               │              │ │                    │
│                               │              │ │                    │
│                               ↓              │ │                    │
│  ┌─────────────────────────────────────┐    │ │                    │
│  │       REPOSITORY LAYER               │    │ │                    │
│  │  (app/repositories/)                 │    │ │                    │
│  │                                      │    │ │                    │
│  │  • user_repository.py                │    │ │                    │
│  │    - create(user)                    │    │ │                    │
│  │    - get_by_id(id)                   │    │ │                    │
│  │    - get_by_email(email)             │    │ │                    │
│  │                                      │    │ │                    │
│  │  • skill_repository.py               │    │ │                    │
│  │    - get_by_name(name)               │    │ │                    │
│  │                                      │    │ │                    │
│  │  • user_skill_repository.py          │    │ │                    │
│  │    - create(user_id, skill_id)       │    │ │                    │
│  └──────────────────┬───────────────────┘    │ │                    │
│                     │                         │ │                    │
│                     │                         │ │                    │
└─────────────────────┼─────────────────────────┼─┼────────────────────┘
                      │                         │ │
                      │                         │ │
                      ↓                         │ │
         ┌─────────────────────────┐            │ │
         │   POSTGRESQL DATABASE   │            │ │
         │                         │            │ │
         │  Tables:                │            │ │
         │  • users                │            │ │
         │  • skills               │            │ │
         │  • user_skills          │            │ │
         └─────────────────────────┘            │ │
                                                │ │
         ┌──────────────────────────────────────┘ │
         │              FILE UTILITIES             │
         │        (app/utils/file_upload.py)       │
         │                                         │
         │  async def save_resume(file)            │
         │      ├─→ Validate file type (PDF)       │
         │      ├─→ Validate file size (<10MB)     │
         │      ├─→ Generate UUID filename         │
         │      ├─→ Save to uploads/resumes/       │
         │      └─→ Return file path               │
         │                                         │
         └─────────────────────────────────────────┘
                                                  │
         ┌────────────────────────────────────────┘
         │
         │  async def save_profile_picture(file)
         │      ├─→ Validate type (JPG/PNG)
         │      ├─→ Validate size (<5MB)
         │      ├─→ Generate UUID filename
         │      ├─→ Save to uploads/profile_pictures/
         │      └─→ Return file path
         │
         ↓
┌─────────────────────────┐
│    FILE SYSTEM          │
│                         │
│  uploads/               │
│  ├── resumes/           │
│  │   └── {uuid}.pdf     │
│  └── profile_pictures/  │
│      └── {uuid}.jpg     │
└─────────────────────────┘
```

## Data Flow

### 1. Registration Request
```
Client → Router (multipart/form-data)
├── Form Fields: name, email, password, etc.
├── Skills: ["Python", "JavaScript", "FastAPI"]
├── Resume: PDF file
└── Profile Picture: JPG/PNG file
```

### 2. File Processing
```
Service Layer
├── Resume File
│   ├── Validate: application/pdf
│   ├── Check size: < 10MB
│   ├── Generate: 550e8400-e29b-41d4-a716-446655440000.pdf
│   ├── Save: uploads/resumes/550e8400...pdf
│   └── Return: uploads/resumes/550e8400...pdf
│
└── Profile Picture
    ├── Validate: image/jpeg or image/png
    ├── Check size: < 5MB
    ├── Generate: 550e8400-e29b-41d4-a716-446655440001.jpg
    ├── Save: uploads/profile_pictures/550e8400...jpg
    └── Return: uploads/profile_pictures/550e8400...jpg
```

### 3. User Creation
```
Service Layer
├── Hash password with bcrypt
├── Create User object with:
│   ├── Personal info (name, email, etc.)
│   ├── resume_url (from step 2)
│   └── profile_picture_url (from step 2)
│
├── Save to database via UserRepository
├── Associate skills via SkillRepository
└── Commit transaction
```

### 4. Response
```
Router → Client (JSON)
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "resume_url": "uploads/resumes/550e8400...pdf",
  "profile_picture_url": "uploads/profile_pictures/550e8400...jpg",
  ...
}
```

## Layer Interactions

```
┌────────────┐
│   Router   │  ← Handles HTTP, extracts multipart form data
└─────┬──────┘
      │
      ↓
┌────────────┐
│  Service   │  ← Business logic, coordinates file saving & user creation
└─────┬──────┘
      │
      ├──────────┐
      ↓          ↓
┌────────────┐  ┌────────────┐
│  Utils     │  │ Repository │  ← File ops    ← Database ops
└────────────┘  └─────┬──────┘
      │               │
      ↓               ↓
┌────────────┐  ┌────────────┐
│File System │  │  Database  │
└────────────┘  └────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│ Client Request  │
└────────┬────────┘
         │
         ↓
    ┌────────┐
    │Router  │
    └───┬────┘
        │
        ↓
    ┌─────────┐
    │Service  │──→ Validation Error?
    └───┬─────┘        │
        │              ↓
        │         ┌──────────────────┐
        │         │ HTTPException    │
        │         │ - Invalid type   │
        │         │ - File too large │
        │         │ - Missing data   │
        │         └──────────────────┘
        │
        ↓
    ┌──────────┐
    │  Utils   │──→ File Error?
    └───┬──────┘        │
        │              ↓
        │         ┌──────────────────┐
        │         │ HTTPException    │
        │         │ - Write failed   │
        │         └──────────────────┘
        │
        ↓
    ┌──────────┐
    │Repository│──→ DB Error?
    └───┬──────┘        │
        │              ↓
        │         ┌──────────────────┐
        │         │ SQLAlchemy Error │
        │         │ - Duplicate email│
        │         │ - Constraint err │
        │         └──────────────────┘
        │
        ↓
    ┌────────────┐
    │  Database  │
    └────────────┘
```

## File Storage Structure

```
backend/
├── app/
│   ├── routers/
│   │   └── users.py
│   ├── services/
│   │   └── user_service.py
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── skill_repository.py
│   │   └── user_skill_repository.py
│   ├── utils/
│   │   └── file_upload.py
│   ├── schemas/
│   │   └── user.py
│   └── models/
│       └── user.py
│
└── uploads/                    ← Created automatically
    ├── resumes/                ← PDF files
    │   ├── 550e8400-e29b-41d4-a716-446655440000.pdf
    │   ├── 550e8400-e29b-41d4-a716-446655440001.pdf
    │   └── ...
    │
    └── profile_pictures/       ← Image files
        ├── 550e8400-e29b-41d4-a716-446655440002.jpg
        ├── 550e8400-e29b-41d4-a716-446655440003.png
        └── ...
```

## Database Relationships

```
┌──────────────────────────┐
│        users             │
│──────────────────────────│
│ id (PK)                  │
│ full_name                │
│ email (UNIQUE)           │
│ password_hash            │
│ resume_url               │◄─── "uploads/resumes/550e8400...pdf"
│ profile_picture_url      │◄─── "uploads/profile_pictures/550e8400...jpg"
│ ...                      │
└────────┬─────────────────┘
         │
         │ 1:N
         │
         ↓
┌──────────────────────────┐
│     user_skills          │
│──────────────────────────│
│ id (PK)                  │
│ user_id (FK) ────────────┼─── References users.id
│ skill_id (FK) ───────────┼─┐
└──────────────────────────┘ │
                             │
                             │ N:1
                             │
                             ↓
                    ┌──────────────────────────┐
                    │       skills             │
                    │──────────────────────────│
                    │ id (PK)                  │
                    │ name (UNIQUE)            │
                    └──────────────────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────┐
│           Input Validation               │
│  • Form field validation                 │
│  • File type checking (MIME)             │
│  • File size limits                      │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│         Filename Security                │
│  • UUID v4 generation                    │
│  • No user-controlled names              │
│  • Extension from validated file         │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│           Path Security                  │
│  • Path() objects prevent traversal      │
│  • Restricted to upload directories      │
│  • Automatic directory creation          │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│        Password Security                 │
│  • bcrypt hashing                        │
│  • Never store plain passwords           │
└──────────────────────────────────────────┘
```
