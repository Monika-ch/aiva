"""
Schemas Package
Export all schemas for easy importing
"""
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserPublicProfile,
    UserChangePassword
)
from app.schemas.auth import (
    Token,
    TokenData,
    LoginRequest,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm
)
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    PortfolioListResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse
)
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    ChatRequest,
    ChatResponse
)
from app.schemas.share import (
    ShareCreate,
    ShareUpdate,
    ShareResponse
)

__all__ = [
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserPublicProfile",
    "UserChangePassword",
    # Auth
    "Token",
    "TokenData",
    "LoginRequest",
    "RefreshTokenRequest",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    # Portfolio
    "PortfolioCreate",
    "PortfolioUpdate",
    "PortfolioResponse",
    "PortfolioListResponse",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "SkillCreate",
    "SkillUpdate",
    "SkillResponse",
    "ExperienceCreate",
    "ExperienceUpdate",
    "ExperienceResponse",
    # Message
    "MessageCreate",
    "MessageResponse",
    "ConversationCreate",
    "ConversationResponse",
    "ConversationListResponse",
    "ChatRequest",
    "ChatResponse",
    # Share
    "ShareCreate",
    "ShareUpdate",
    "ShareResponse",
]
