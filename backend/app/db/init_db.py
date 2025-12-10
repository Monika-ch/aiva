"""
Database initialization
Import all models here to ensure they're registered with SQLAlchemy
"""
from app.db.session import Base, engine
from app.models.user import User
from app.models.portfolio import Portfolio, Project, Skill, Experience
from app.models.share import Share
from app.models.message import Message, Conversation


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all tables - use with caution!"""
    Base.metadata.drop_all(bind=engine)
