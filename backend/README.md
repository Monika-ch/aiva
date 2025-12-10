# AIVA Backend API

**AI-Powered Portfolio Assistant - Backend Infrastructure**

FastAPI-based REST API for the AIVA dual-mode portfolio platform with PostgreSQL database, JWT authentication, and OpenAI integration.

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/              # API routes
│   │   └── routes/       # Route handlers
│   ├── core/             # Core functionality
│   │   ├── config.py     # Settings & environment
│   │   ├── security.py   # JWT & password hashing
│   │   └── deps.py       # FastAPI dependencies
│   ├── db/               # Database
│   │   ├── session.py    # SQLAlchemy session
│   │   └── init_db.py    # Database initialization
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   ├── portfolio.py  # Portfolio, Project, Skill, Experience
│   │   ├── message.py    # Message, Conversation
│   │   └── share.py      # Portfolio sharing
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py       # User request/response models
│   │   ├── auth.py       # Authentication models
│   │   ├── portfolio.py  # Portfolio models
│   │   ├── message.py    # Chat models
│   │   └── share.py      # Share models
│   ├── services/         # Business logic
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Poetry configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.12+
- PostgreSQL 14+
- pip or Poetry

### 2. Environment Setup

```bash
# Clone and navigate
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
# or
poetry install

# Copy environment file
cp .env.example .env

# Edit .env and configure:
# - DATABASE_URL
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - OPENAI_API_KEY
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb aiva_db

# Or via psql:
psql -U postgres
CREATE DATABASE aiva_db;
\q

# Initialize database (creates tables)
python -c "from app.db.init_db import init_db; init_db()"

# Or run migrations (once implemented):
alembic upgrade head
```

### 4. Run Development Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main

# Or using the main.py directly
cd app && python main.py
```

Server will start at: **http://localhost:8000**

- API Docs (Swagger): http://localhost:8000/docs
- Alternative Docs (ReDoc): http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 📊 Database Models

### **User**
- Supports two roles: `candidate` and `recruiter`
- JWT-based authentication
- Profile information and settings

### **Portfolio**
- Belongs to a user (candidate)
- Visibility: public, unlisted, private
- Unique slug for public URLs
- SEO metadata

### **Project**
- Portfolio projects/case studies
- Tech stack, features, images
- Demo and repository links

### **Skill**
- Technical skills with proficiency levels
- Categorized (Frontend, Backend, Tools, etc.)

### **Experience**
- Work history and achievements
- Technologies used per role

### **Share**
- Portfolio sharing with recruiters
- Track views and engagement
- Optional expiration dates

### **Message & Conversation**
- AI chat conversations
- User-to-user messaging
- Portfolio-specific chat context

## 🔐 Authentication Flow

1. **Sign Up**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login` → Returns access_token & refresh_token
3. **Protected Routes**: Include `Authorization: Bearer <access_token>` header
4. **Refresh Token**: `POST /api/auth/refresh` with refresh_token
5. **Logout**: Client discards tokens

## 🛣️ API Endpoints (Planned)

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Confirm password reset

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user
- `POST /api/users/me/change-password` - Change password
- `GET /api/users/{username}` - Get public profile

### Portfolios
- `GET /api/portfolios` - List user's portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/{id}` - Get portfolio details
- `PATCH /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio
- `GET /api/portfolios/slug/{slug}` - Get portfolio by slug (public)

### Projects, Skills, Experiences
- Similar CRUD operations for each resource
- Nested under portfolios

### Chat/AI
- `POST /api/chat` - Send message to AI
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/{id}` - Get conversation history
- `DELETE /api/chat/conversations/{id}` - Delete conversation

### Shares
- `POST /api/shares` - Share portfolio with recruiter
- `GET /api/shares` - List shared portfolios
- `PATCH /api/shares/{id}` - Update share settings
- `DELETE /api/shares/{id}` - Revoke share

## 🤖 AI Integration

The backend integrates with OpenAI's GPT-4 for intelligent portfolio assistance:

1. **Portfolio-Specific Chat**: AI answers questions using portfolio context
2. **Content Generation**: Help candidates write compelling descriptions
3. **Recruiter Insights**: Provide summaries and highlights for recruiters
4. **RAG (Retrieval-Augmented Generation)**: Context from portfolio data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password storage
- **CORS Protection**: Configurable allowed origins
- **Role-Based Access Control**: Candidate/Recruiter/Admin roles
- **Input Validation**: Pydantic schemas for all requests
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Rate Limiting**: (To be implemented)

## 🧪 Testing

```bash
# Run tests (once implemented)
pytest

# With coverage
pytest --cov=app tests/
```

## 📦 Deployment

### Using Docker (Recommended)

```bash
# Build image
docker build -t aiva-backend .

# Run container
docker run -p 8000:8000 --env-file .env aiva-backend
```

### Using Railway/Render/Fly.io

1. Push code to GitHub
2. Connect repository to platform
3. Configure environment variables
4. Deploy!

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate secure `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backups

## 🛠️ Development

### Adding a New Endpoint

1. Create route handler in `app/api/routes/`
2. Define request/response schemas in `app/schemas/`
3. Implement business logic in `app/services/` (if complex)
4. Add route to `app/main.py`

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📚 Technologies

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Relational database
- **Pydantic**: Data validation
- **python-jose**: JWT implementation
- **passlib**: Password hashing
- **OpenAI**: AI integration
- **Uvicorn**: ASGI server

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests and linting
4. Submit pull request

## 📝 License

MIT License

## 👥 Authors

Monika - Full Stack Development

---

**Status**: 🚧 In Development

**Next Steps**:
1. Implement API route handlers
2. Add OpenAI service integration
3. Set up Alembic migrations
4. Write tests
5. Add Docker configuration
6. Deploy to production
