"""
Message and Chat Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.message import MessageType


class MessageBase(BaseModel):
    content: str
    message_type: MessageType = MessageType.USER
    reply_to_id: Optional[int] = None


class MessageCreate(MessageBase):
    conversation_id: Optional[int] = None
    triggered_by_voice: bool = False


class MessageResponse(MessageBase):
    id: int
    conversation_id: Optional[int] = None
    sender_id: Optional[int] = None
    recipient_id: Optional[int] = None
    is_read: bool
    ai_model: Optional[str] = None
    triggered_by_voice: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationBase(BaseModel):
    title: Optional[str] = None
    portfolio_id: Optional[int] = None


class ConversationCreate(ConversationBase):
    pass


class ConversationResponse(ConversationBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Simplified conversation for list views"""
    id: int
    title: Optional[str] = None
    portfolio_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    message_count: int = 0
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Request for AI chat"""
    message: str
    conversation_id: Optional[int] = None
    portfolio_id: Optional[int] = None
    triggered_by_voice: bool = False


class ChatResponse(BaseModel):
    """Response from AI chat"""
    message: MessageResponse
    conversation_id: int
