import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from typing import Optional


# ============================================================
# CONSTANTS
# ============================================================

UPLOAD_DIR = Path("uploads")
RESUME_DIR = UPLOAD_DIR / "resumes"
PROFILE_PICTURE_DIR = UPLOAD_DIR / "profile_pictures"

# File size limits (in bytes)
MAX_RESUME_SIZE = 10 * 1024 * 1024  # 10MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

# Allowed file types
ALLOWED_RESUME_TYPES = {"application/pdf"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png"}


# ============================================================
# DIRECTORY INITIALIZATION
# ============================================================

def ensure_upload_directories():
    """Create upload directories if they don't exist."""
    RESUME_DIR.mkdir(parents=True, exist_ok=True)
    PROFILE_PICTURE_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# FILE VALIDATION
# ============================================================

def validate_file_type(file: UploadFile, allowed_types: set):
    """Validate that the uploaded file has an allowed content type."""
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
        )


def validate_file_size(file_content: bytes, max_size: int, file_type: str):
    """Validate that the file size is within the allowed limit."""
    file_size = len(file_content)
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"{file_type} too large. Maximum size: {max_size / (1024 * 1024):.1f}MB"
        )


# ============================================================
# FILE OPERATIONS
# ============================================================

async def save_resume(resume: Optional[UploadFile]) -> Optional[str]:
    """
    Validate and save resume file.
    
    Args:
        resume: The uploaded resume file
        
    Returns:
        The relative file path as a string, or None if no file provided
        
    Raises:
        HTTPException: If validation fails
    """
    if not resume:
        return None
    
    # Validate file type
    validate_file_type(resume, ALLOWED_RESUME_TYPES)
    
    # Read file content
    file_content = await resume.read()
    
    # Validate file size
    validate_file_size(file_content, MAX_RESUME_SIZE, "Resume")
    
    # Ensure directory exists
    ensure_upload_directories()
    
    # Generate unique filename
    extension = Path(resume.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"
    file_path = RESUME_DIR / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative path
    return str(file_path)


async def save_profile_picture(profile_picture: Optional[UploadFile]) -> Optional[str]:
    """
    Validate and save profile picture file.
    
    Args:
        profile_picture: The uploaded image file
        
    Returns:
        The relative file path as a string, or None if no file provided
        
    Raises:
        HTTPException: If validation fails
    """
    if not profile_picture:
        return None
    
    # Validate file type
    validate_file_type(profile_picture, ALLOWED_IMAGE_TYPES)
    
    # Read file content
    file_content = await profile_picture.read()
    
    # Validate file size
    validate_file_size(file_content, MAX_IMAGE_SIZE, "Profile picture")
    
    # Ensure directory exists
    ensure_upload_directories()
    
    # Generate unique filename
    extension = Path(profile_picture.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"
    file_path = PROFILE_PICTURE_DIR / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative path
    return str(file_path)


def delete_file(file_path: str) -> bool:
    """
    Delete a file from disk if it exists.
    
    Args:
        file_path: The path to the file to delete
        
    Returns:
        True if the file was deleted, False if it didn't exist
    """
    if not file_path:
        return False
    
    path = Path(file_path)
    
    if path.exists() and path.is_file():
        try:
            path.unlink()
            return True
        except Exception:
            return False
    
    return False
