"""
Portfolio Models
Portfolio, Project, Skill, and Experience models
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class PortfolioVisibility(str, enum.Enum):
    """Portfolio visibility options"""
    PUBLIC = "public"      # Visible to everyone
    UNLISTED = "unlisted"  # Only accessible via direct link
    PRIVATE = "private"    # Only visible to owner


class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Basic Info
    title = Column(String, nullable=False)
    tagline = Column(String)
    bio = Column(Text)
    profile_image = Column(String)
    resume_url = Column(String, nullable=True)
    
    # Settings
    visibility = Column(SQLEnum(PortfolioVisibility), default=PortfolioVisibility.PRIVATE)
    slug = Column(String, unique=True, index=True, nullable=False)  # For public URLs
    is_default = Column(Boolean, default=False)  # Primary portfolio
    
    # SEO & Metadata
    meta_title = Column(String)
    meta_description = Column(String)
    
    # Contact & Social
    contact_email = Column(String)
    phone = Column(String)
    location = Column(String)
    website = Column(String)
    linkedin = Column(String)
    github = Column(String)
    twitter = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="portfolios")
    projects = relationship("Project", back_populates="portfolio", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="portfolio", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="portfolio", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="portfolio", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Portfolio(id={self.id}, title={self.title}, user_id={self.user_id})>"


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    
    # Project Info
    title = Column(String, nullable=False)
    description = Column(Text)
    role = Column(String)
    company = Column(String)
    
    # Dates
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)  # Null = ongoing
    
    # Details
    tech_stack = Column(JSON)  # Array of technologies
    features = Column(JSON)    # Array of features/achievements
    images = Column(JSON)      # Array of image URLs
    demo_url = Column(String)
    repo_url = Column(String)
    
    # Display
    is_featured = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="projects")
    
    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title})>"


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    
    # Skill Info
    name = Column(String, nullable=False)
    category = Column(String)  # e.g., "Frontend", "Backend", "Tools"
    proficiency = Column(Integer)  # 1-5 or 1-100
    years_experience = Column(Integer, nullable=True)
    
    # Display
    order_index = Column(Integer, default=0)
    is_highlighted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="skills")
    
    def __repr__(self):
        return f"<Skill(id={self.id}, name={self.name})>"


class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    
    # Experience Info
    title = Column(String, nullable=False)  # Job title
    company = Column(String, nullable=False)
    location = Column(String)
    employment_type = Column(String)  # Full-time, Part-time, Contract, etc.
    
    # Dates
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)  # Null = current position
    
    # Details
    description = Column(Text)
    achievements = Column(JSON)  # Array of achievements
    technologies = Column(JSON)  # Array of technologies used
    
    # Display
    order_index = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="experiences")
    
    def __repr__(self):
        return f"<Experience(id={self.id}, title={self.title}, company={self.company})>"
