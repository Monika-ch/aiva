"""
Upload Schemas
Pydantic models for file upload endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional

class UploadResponse(BaseModel):
    """Response for file upload"""
    success: bool
    message: str
    file_path: str
    file_name: str
    file_type: str
    file_size: int
    category: str


class LinkedInUploadRequest(BaseModel):
    """Request for LinkedIn data upload"""
    profile_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    raw_data: Optional[str] = Field(None, description="Raw LinkedIn data (JSON)")


class LinkedInUploadResponse(BaseModel):
    """Response for LinkedIn upload"""
    success: bool
    message: str
    profile_url: Optional[str] = None
    data_source: str  # "url" or "raw_data"
    stored_path: Optional[str] = None
