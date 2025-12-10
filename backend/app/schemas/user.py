"""
User Schemas
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.CANDIDATE


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None


class UserChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# Response schemas
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    profile_image: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserPublicProfile(BaseModel):
    """Public profile view (limited info)"""
    id: int
    username: str
    full_name: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    
    class Config:
        from_attributes = True
