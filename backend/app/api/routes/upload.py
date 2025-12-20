"""
Upload Routes
Handles file uploads for LinkedIn profiles, resumes, and documents
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
from pathlib import Path
from datetime import datetime

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.upload import (
    UploadResponse,
    LinkedInUploadRequest,
    LinkedInUploadResponse
)

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-excel": ".xls",
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
}

# File size limits (in bytes)
MAX_RESUME_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_file_type(file: UploadFile, allowed_types: dict) -> str:
    """Validate file type and return extension"""
    content_type = file.content_type
    
    if content_type not in allowed_types:
        allowed = ", ".join(allowed_types.values())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {allowed}"
        )
    
    return allowed_types[content_type]


def validate_file_size(file: UploadFile, max_size: int) -> None:
    """Validate file size"""
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {max_mb}MB"
        )


def save_upload_file(file: UploadFile, user_id: int, category: str) -> str:
    """Save uploaded file and return file path"""
    # Create user directory
    user_dir = UPLOAD_DIR / str(user_id) / category
    user_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    extension = Path(file.filename).suffix
    filename = f"{timestamp}_{file.filename}"
    file_path = user_dir / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)


@router.post("/resume", response_model=UploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload resume file (PDF, DOCX, DOC)
    
    - Validates file type and size
    - Stores file securely
    - Returns file metadata
    - File will be parsed by AI service in next step
    """
    # Validate file type
    extension = validate_file_type(file, ALLOWED_RESUME_TYPES)
    
    # Validate file size
    validate_file_size(file, MAX_RESUME_SIZE)
    
    # Save file
    try:
        file_path = save_upload_file(file, current_user.id, "resumes")
        
        return UploadResponse(
            success=True,
            message="Resume uploaded successfully",
            file_path=file_path,
            file_name=file.filename,
            file_type=file.content_type,
            file_size=Path(file_path).stat().st_size,
            category="resume"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.post("/documents", response_model=List[UploadResponse])
async def upload_documents(
    files: List[UploadFile] = File(..., description="Multiple files to upload"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload multiple document files (images, PDFs)
    
    - Supports multiple file upload
    - Validates each file type and size
    - Returns metadata for all uploaded files
    - Images will be processed with OCR in next step
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    uploaded_files = []
    
    for file in files:
        try:
            # Determine file type and validate
            if file.content_type in ALLOWED_IMAGE_TYPES:
                extension = validate_file_type(file, ALLOWED_IMAGE_TYPES)
                validate_file_size(file, MAX_IMAGE_SIZE)
                category = "images"
            elif file.content_type in ALLOWED_RESUME_TYPES:
                extension = validate_file_type(file, ALLOWED_RESUME_TYPES)
                validate_file_size(file, MAX_RESUME_SIZE)
                category = "documents"
            else:
                # Skip invalid files with warning
                continue
            
            # Save file
            file_path = save_upload_file(file, current_user.id, category)
            
            uploaded_files.append(
                UploadResponse(
                    success=True,
                    message=f"File uploaded successfully",
                    file_path=file_path,
                    file_name=file.filename,
                    file_type=file.content_type,
                    file_size=Path(file_path).stat().st_size,
                    category=category
                )
            )
        
        except HTTPException as e:
            # Add error for this specific file
            uploaded_files.append(
                UploadResponse(
                    success=False,
                    message=str(e.detail),
                    file_path="",
                    file_name=file.filename,
                    file_type=file.content_type,
                    file_size=0,
                    category="error"
                )
            )
    
    if not uploaded_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid files were uploaded"
        )
    
    return uploaded_files


@router.post("/linkedin", response_model=LinkedInUploadResponse)
async def upload_linkedin_data(
    data: LinkedInUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload LinkedIn profile URL or raw data
    
    - Accepts LinkedIn profile URL
    - Or accepts raw LinkedIn data (JSON export)
    - Stores for AI parsing in next step
    - Returns confirmation
    """
    # TODO: In next step, integrate LinkedIn scraping or parsing
    # For now, just store the URL/data
    
    if data.profile_url:
        # Validate LinkedIn URL format
        if "linkedin.com/in/" not in data.profile_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid LinkedIn profile URL. Must contain 'linkedin.com/in/'"
            )
        
        return LinkedInUploadResponse(
            success=True,
            message="LinkedIn profile URL received. Will be processed by AI.",
            profile_url=data.profile_url,
            data_source="url"
        )
    
    elif data.raw_data:
        # Store raw LinkedIn data
        user_dir = UPLOAD_DIR / str(current_user.id) / "linkedin"
        user_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = user_dir / f"linkedin_data_{timestamp}.json"
        
        with open(file_path, "w") as f:
            f.write(data.raw_data)
        
        return LinkedInUploadResponse(
            success=True,
            message="LinkedIn data received. Will be processed by AI.",
            profile_url=None,
            data_source="raw_data",
            stored_path=str(file_path)
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either profile_url or raw_data must be provided"
        )


@router.get("/list")
async def list_uploads(
    current_user: User = Depends(get_current_user),
    category: Optional[str] = None
):
    """
    List all uploaded files for current user
    
    - Returns list of uploaded files
    - Optional filter by category (resumes, documents, images, linkedin)
    """
    user_dir = UPLOAD_DIR / str(current_user.id)
    
    if not user_dir.exists():
        return {"files": [], "message": "No uploads found"}
    
    files = []
    
    # Determine which directories to scan
    if category:
        dirs_to_scan = [user_dir / category] if (user_dir / category).exists() else []
    else:
        dirs_to_scan = [d for d in user_dir.iterdir() if d.is_dir()]
    
    for dir_path in dirs_to_scan:
        for file_path in dir_path.iterdir():
            if file_path.is_file():
                files.append({
                    "file_name": file_path.name,
                    "category": dir_path.name,
                    "file_size": file_path.stat().st_size,
                    "upload_date": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
                    "file_path": str(file_path)
                })
    
    return {
        "files": files,
        "total": len(files),
        "user_id": current_user.id
    }
