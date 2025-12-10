"""
Share Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ShareBase(BaseModel):
    shared_with_email: EmailStr
    message: Optional[str] = None
    expires_at: Optional[datetime] = None


class ShareCreate(ShareBase):
    portfolio_id: int


class ShareUpdate(BaseModel):
    is_active: Optional[bool] = None
    message: Optional[str] = None
    expires_at: Optional[datetime] = None


class ShareResponse(ShareBase):
    id: int
    portfolio_id: int
    shared_by_user_id: int
    view_count: int
    last_viewed_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
