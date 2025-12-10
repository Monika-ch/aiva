"""
Share Model
Tracks portfolio shares with recruiters
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Share(Base):
    __tablename__ = "shares"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    shared_with_email = Column(String, index=True)  # Recruiter email (may not be a user)
    shared_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Tracking
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)  # Can be revoked
    
    # Optional message/note
    message = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Optional expiration
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="shares")
    
    def __repr__(self):
        return f"<Share(id={self.id}, portfolio_id={self.portfolio_id}, shared_with={self.shared_with_email})>"
