"""
Portfolio Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.portfolio import PortfolioVisibility


# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tech_stack: Optional[List[str]] = []
    features: Optional[List[str]] = []
    images: Optional[List[str]] = []
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    is_featured: bool = False
    order_index: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tech_stack: Optional[List[str]] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    is_featured: Optional[bool] = None
    order_index: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: int
    portfolio_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Skill Schemas
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency: Optional[int] = Field(None, ge=1, le=100)
    years_experience: Optional[int] = None
    is_highlighted: bool = False
    order_index: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = Field(None, ge=1, le=100)
    years_experience: Optional[int] = None
    is_highlighted: Optional[bool] = None
    order_index: Optional[int] = None


class SkillResponse(SkillBase):
    id: int
    portfolio_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Experience Schemas
class ExperienceBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    order_index: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    order_index: Optional[int] = None


class ExperienceResponse(ExperienceBase):
    id: int
    portfolio_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Portfolio Schemas
class PortfolioBase(BaseModel):
    title: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    resume_url: Optional[str] = None
    visibility: PortfolioVisibility = PortfolioVisibility.PRIVATE
    slug: str
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    resume_url: Optional[str] = None
    visibility: Optional[PortfolioVisibility] = None
    slug: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    is_default: bool
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    projects: List[ProjectResponse] = []
    skills: List[SkillResponse] = []
    experiences: List[ExperienceResponse] = []
    
    class Config:
        from_attributes = True


class PortfolioListResponse(BaseModel):
    """Simplified portfolio for list views"""
    id: int
    title: str
    tagline: Optional[str] = None
    slug: str
    visibility: PortfolioVisibility
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
