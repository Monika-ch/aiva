"""
Message and Conversation Models
For chat functionality and recruiter-candidate communication
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class MessageType(str, enum.Enum):
    """Message type enumeration"""
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=True)
    
    # Conversation metadata
    title = Column(String, nullable=True)  # Auto-generated or user-set
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id})>"


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True)
    
    # Sender/Recipient (for direct messages between users)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Message content
    content = Column(Text, nullable=False)
    message_type = Column(SQLEnum(MessageType), default=MessageType.USER)
    
    # Metadata
    is_read = Column(Boolean, default=False)
    reply_to_id = Column(Integer, ForeignKey("messages.id"), nullable=True)  # For threading
    
    # Voice/AI metadata (optional)
    triggered_by_voice = Column(Boolean, default=False)
    ai_model = Column(String, nullable=True)  # e.g., "gpt-4"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_messages"
    )
    recipient = relationship(
        "User",
        foreign_keys=[recipient_id],
        back_populates="received_messages"
    )
    replies = relationship(
        "Message",
        backref="parent_message",
        remote_side=[id]
    )
    
    def __repr__(self):
        return f"<Message(id={self.id}, type={self.message_type}, conversation_id={self.conversation_id})>"
