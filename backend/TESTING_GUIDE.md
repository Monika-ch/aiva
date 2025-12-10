# 🧪 AIVA Backend Testing Guide

Complete guide to testing your FastAPI backend with examples and explanations.

---

## 📋 Table of Contents

1. [Health Check Tests](#1-health-check-tests)
2. [Database Connection Test](#2-database-connection-test)
3. [API Testing Methods](#3-api-testing-methods)
4. [Testing with Swagger UI](#4-testing-with-swagger-ui)
5. [Testing with curl (Terminal)](#5-testing-with-curl-terminal)
6. [Testing with Python](#6-testing-with-python)
7. [Database Inspection](#7-database-inspection)

---

## 1. Health Check Tests

### ✅ Test 1: Basic Server Health

**What it does:** Confirms your server is running

**Open in browser:**

```
http://127.0.0.1:8000
```

**Expected Response:**

```json
{
  "message": "AIVA Backend API",
  "version": "0.1.0",
  "status": "healthy",
  "environment": "development"
}
```

**💡 What this means:** Your FastAPI server started successfully!

---

### ✅ Test 2: Detailed Health Check

**URL:**

```
http://127.0.0.1:8000/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development"
}
```

---

## 2. Database Connection Test

### ✅ Verify Database Tables

**Run in terminal:**

```bash
cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
source venv/bin/activate
python -c "
from app.db.session import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print('📊 Database Tables:')
for table in tables:
    print(f'  ✓ {table}')
"
```

**Expected Output:**

```
📊 Database Tables:
  ✓ users
  ✓ portfolios
  ✓ projects
  ✓ skills
  ✓ experiences
  ✓ shares
  ✓ conversations
  ✓ messages
```

**💡 What this means:** All 8 tables were created successfully in PostgreSQL!

---

## 3. API Testing Methods

You have 4 ways to test your backend:

### Method 1: **Swagger UI** (Interactive, Easiest) ⭐ RECOMMENDED

- Visual interface with "Try it out" buttons
- URL: http://127.0.0.1:8000/docs

### Method 2: **curl** (Terminal/Command Line)

- Quick tests from terminal
- Good for automation

### Method 3: **Python Script**

- Programmatic testing
- Can save to files

### Method 4: **Postman/Thunder Client** (Optional)

- Professional API testing tool
- VS Code extension available

---

## 4. Testing with Swagger UI (Interactive)

**💡 This is the EASIEST way to test!**

### Step-by-Step:

1. **Open Swagger UI:**

   ```
   http://127.0.0.1:8000/docs
   ```

2. **You'll see 2 blue boxes (GET endpoints):**
   - `GET /` - Root endpoint
   - `GET /health` - Health check

   **Note:** Right now you only see GET endpoints because we haven't built the API routes yet. When we add authentication, portfolios, etc., you'll also see:
   - Green boxes = POST requests (create data)
   - Orange boxes = PUT/PATCH requests (update data)
   - Red boxes = DELETE requests (remove data)

3. **Test the root endpoint:**
   - Click on `GET /`
   - Click "Try it out"
   - Click "Execute"
   - See the response below

4. **What you'll see:**
   ```json
   {
     "message": "AIVA Backend API",
     "version": "0.1.0",
     "status": "healthy",
     "environment": "development"
   }
   ```

**💡 Why use Swagger?**

- No coding required
- Visual and interactive
- Shows request/response formats
- Automatically validates data

---

## 5. Testing with curl (Terminal)

**💡 Great for quick tests from command line**

### Test 1: Root Endpoint

```bash
curl http://127.0.0.1:8000/
```

**Response:**

```json
{
  "message": "AIVA Backend API",
  "version": "0.1.0",
  "status": "healthy",
  "environment": "development"
}
```

### Test 2: Health Check

```bash
curl http://127.0.0.1:8000/health
```

**Response:**

```json
{ "status": "healthy", "version": "0.1.0", "environment": "development" }
```

### Test 3: With Pretty Formatting

```bash
curl http://127.0.0.1:8000/ | jq
```

**Response:**

```json
{
  "message": "AIVA Backend API",
  "version": "0.1.0",
  "status": "healthy",
  "environment": "development"
}
```

**💡 Note:** `jq` is a JSON formatter. Install with: `sudo apt install jq`

---

## 6. Testing with Python

**💡 Programmatic testing - useful for automation**

### Step 1: Navigate to backend directory

```bash
cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
```

### Step 2: Create the test file

**Option A: Using nano editor**

```bash
nano test_backend.py
```

Then paste the code below, press `Ctrl+O` to save, `Enter` to confirm, and `Ctrl+X` to exit.

**Option B: Using VS Code**

- Right-click on `backend` folder → New File → name it `test_backend.py`
- Copy and paste the code below

**Option C: Using command line**

```bash
cat > test_backend.py << 'EOF'
# (paste the code here)
EOF
```

### Step 3: Copy this code into `test_backend.py`:

```python
import requests
import json

# Base URL
BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    print("\n🧪 Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Health check passed!")
    else:
        print("❌ Health check failed!")

    return response.status_code == 200

def test_root():
    """Test root endpoint"""
    print("\n🧪 Testing Root Endpoint...")
    response = requests.get(f"{BASE_URL}/")

    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")

    # Verify response structure
    assert "message" in data
    assert "version" in data
    assert data["status"] == "healthy"

    print("✅ Root endpoint test passed!")
    return True

if __name__ == "__main__":
    print("🚀 Starting Backend Tests...\n")

    # Run tests
    test_root()
    test_health()

    print("\n✅ All tests completed!")
```

### Step 4: Install requests library (if needed)

```bash
source venv/bin/activate
pip install requests
```

### Step 5: Run the test

```bash
python test_backend.py
```

**Expected Output:**

```
🚀 Starting Backend Tests...

🧪 Testing Root Endpoint...
Status Code: 200
Response: {
  "message": "AIVA Backend API",
  "version": "0.1.0",
  "status": "healthy",
  "environment": "development"
}
✅ Root endpoint test passed!

🧪 Testing Health Endpoint...
Status Code: 200
Response: {
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development"
}
✅ Health check passed!

✅ All tests completed!
```

---

## 7. Database Inspection

### ✅ Check Database Connection

**PostgreSQL Command Line:**

```bash
sudo -u postgres psql aiva_db
```

**Inside psql, run:**

```sql
-- List all tables
\dt

-- See users table structure
\d users

-- See portfolios table structure
\d portfolios

-- Count rows in tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM portfolios;

-- Exit psql
\q
```

**Expected Output for `\dt`:**

```
                List of relations
 Schema |      Name      | Type  |  Owner
--------+----------------+-------+----------
 public | conversations  | table | postgres
 public | experiences    | table | postgres
 public | messages       | table | postgres
 public | portfolios     | table | postgres
 public | projects       | table | postgres
 public | shares         | table | postgres
 public | skills         | table | postgres
 public | users          | table | postgres
```

**Expected Output for `\d users`:**

```
                                            Table "public.users"
     Column      |            Type             | Collation | Nullable |              Default
-----------------+-----------------------------+-----------+----------+-----------------------------------
 id              | integer                     |           | not null | nextval('users_id_seq'::regclass)
 email           | character varying           |           | not null |
 username        | character varying           |           | not null |
 hashed_password | character varying           |           | not null |
 full_name       | character varying           |           |          |
 role            | userrole                    |           | not null |
 profile_image   | character varying           |           |          |
 bio             | text                        |           |          |
 is_active       | boolean                     |           |          | true
 created_at      | timestamp without time zone |           |          | now()
 updated_at      | timestamp without time zone |           |          | now()
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "ix_users_email" UNIQUE, btree (email)
    "ix_users_id" btree (id)
    "ix_users_username" UNIQUE, btree (username)
Referenced by:
    TABLE "conversations" CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    TABLE "messages" CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    TABLE "messages" CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    TABLE "portfolios" CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    TABLE "shares" CONSTRAINT "shares_shared_by_user_id_fkey" FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE
```

**Expected Output for `\d portfolios`:**

```
                                              Table "public.portfolios"
      Column       |            Type             | Collation | Nullable |                 Default
-------------------+-----------------------------+-----------+----------+------------------------------------------
 id                | integer                     |           | not null | nextval('portfolios_id_seq'::regclass)
 user_id           | integer                     |           | not null |
 title             | character varying           |           | not null |
 slug              | character varying           |           |          |
 tagline           | character varying           |           |          |
 bio               | text                        |           |          |
 visibility        | portfoliovisibility         |           | not null |
 theme             | character varying           |           |          | 'default'::character varying
 custom_domain     | character varying           |           |          |
 seo_title         | character varying           |           |          |
 seo_description   | character varying           |           |          |
 seo_keywords      | character varying           |           |          |
 profile_image_url | character varying           |           |          |
 created_at        | timestamp without time zone |           |          | now()
 updated_at        | timestamp without time zone |           |          | now()
Indexes:
    "portfolios_pkey" PRIMARY KEY, btree (id)
    "ix_portfolios_id" btree (id)
    "ix_portfolios_slug" UNIQUE, btree (slug)
Foreign-key constraints:
    "portfolios_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
Referenced by:
    TABLE "experiences" CONSTRAINT "experiences_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    TABLE "projects" CONSTRAINT "projects_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    TABLE "shares" CONSTRAINT "shares_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    TABLE "skills" CONSTRAINT "skills_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
```

**Expected Output for `SELECT COUNT(*)`:**

```
 count
-------
     0
(1 row)
```

_Note: Both tables are empty because we haven't created any users or portfolios yet._

**💡 What this shows:** All your tables exist in the database!

---

### ✅ Python Database Query Test

Create `test_database.py`:

```python
from app.db.session import SessionLocal
from app.models.user import User
from app.models.portfolio import Portfolio

def test_database_connection():
    """Test database connection and tables"""
    print("\n🧪 Testing Database Connection...\n")

    # Create session
    db = SessionLocal()

    try:
        # Query users table
        user_count = db.query(User).count()
        print(f"✓ Users table: {user_count} records")

        # Query portfolios table
        portfolio_count = db.query(Portfolio).count()
        print(f"✓ Portfolios table: {portfolio_count} records")

        print("\n✅ Database connection successful!")
        print("✅ All tables are accessible!")

    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database_connection()
```

**Run it:**

```bash
cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
source venv/bin/activate
python test_database.py
```

**Expected Output:**

```
🧪 Testing Database Connection...

2025-12-09 16:52:45,883 INFO sqlalchemy.engine.Engine [generated in 0.00015s] {}
✓ Portfolios table: 0 records

✅ Database connection successful!
✅ All tables are accessible!
2025-12-09 16:52:45,884 INFO sqlalchemy.engine.Engine ROLLBACK
```

**💡 What you'll see:**

- SQLAlchemy logs showing database queries (normal behavior)
- Both tables showing 0 records (empty database)
- Success messages confirming connection works
- ROLLBACK message (SQLAlchemy cleaning up - this is normal)

---

## 8. Common Test Scenarios

### ✅ Test Server Restart

1. **Stop server:** Press `Ctrl+C` in the terminal running uvicorn
2. **Start again:**
   ```bash
   cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
   source venv/bin/activate
   python -m uvicorn app.main:app --reload --port 8000
   ```
3. **Test health:** Open http://127.0.0.1:8000/health

**💡 Why test this?** Ensures your server can restart cleanly.

---

### ✅ Test Auto-Reload

1. **With server running**, edit `app/main.py`:

   ```python
   # Change this line:
   "message": "AIVA Backend API",
   # To:
   "message": "AIVA Backend API - Modified!",
   ```

2. **Save the file**

3. **Watch terminal:** You'll see:

   ```
   INFO:     Detected file change in 'app/main.py'. Reloading...
   ```

   Then the server restarts with database initialization:

   ```
   🚀 Starting AIVA Backend...
   📊 Environment: development
   🔧 Debug Mode: True
   [SQLAlchemy logs showing database table checks...]
   ✅ Database initialized successfully
   INFO:     Application startup complete.
   ```

4. **Test:** Open http://127.0.0.1:8000/ - you'll see the new message!

**💡 Why test this?** Confirms auto-reload is working (saves development time).

---

## 9. Monitoring Server Logs

**💡 The terminal running uvicorn shows real-time logs**

**What to watch for:**

```bash
# ✅ Good - Server started
INFO:     Uvicorn running on http://127.0.0.1:8000

# ✅ Good - Request received
INFO:     127.0.0.1:12345 - "GET / HTTP/1.1" 200 OK

# ✅ Good - Database query
INFO sqlalchemy.engine.Engine SELECT * FROM users

# ❌ Bad - Server error
ERROR:    Exception in ASGI application

# ⚠️  Warning - Slow query
WARNING:  Query took 5.2 seconds
```

**💡 Status Codes:**

- `200` = Success ✅
- `404` = Not Found ❌
- `500` = Server Error ❌
- `401` = Unauthorized 🔒

---

## 10. Quick Reference Commands

### Start Backend Server

```bash
cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### Stop Backend Server

Press `Ctrl+C` in the terminal

### Test Health

```bash
curl http://127.0.0.1:8000/health
```

### Open Swagger Docs

```
http://127.0.0.1:8000/docs
```

### Check Database

```bash
sudo -u postgres psql aiva_db -c "\dt"
```

### View Logs

Just watch the terminal running uvicorn

---

## 11. Troubleshooting

### ❌ Problem: Port 8000 already in use

**Solution:**

```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or use different port
uvicorn app.main:app --reload --port 8001
```

---

### ❌ Problem: Can't connect to database

**Check if PostgreSQL is running:**

```bash
sudo systemctl status postgresql
```

**Start PostgreSQL if stopped:**

```bash
sudo systemctl start postgresql
```

---

### ❌ Problem: Import errors

**Solution:**

```bash
cd /home/monika/Desktop/Projects/ai-portfolio-assistant/AIVA/backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## 12. Next Steps: When API Endpoints Are Added

Once we build the actual API endpoints (signup, login, create portfolio, etc.), you'll be able to test:

### Example: User Signup (Future)

```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "monika@example.com",
    "username": "monika",
    "password": "SecurePass123!",
    "full_name": "Monika"
  }'
```

### Example: Login (Future)

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "monika@example.com",
    "password": "SecurePass123!"
  }'
```

---

## ✅ Summary Checklist

Run through this checklist to ensure everything works:

- [ ] Server starts without errors
- [ ] `http://127.0.0.1:8000/` returns healthy status
- [ ] `http://127.0.0.1:8000/health` works
- [ ] Swagger UI opens at `http://127.0.0.1:8000/docs`
- [ ] Database has 8 tables
- [ ] Auto-reload works when you edit files
- [ ] Server logs show requests
- [ ] Can stop and restart server successfully

---

## 🎯 You're Ready!

Your backend infrastructure is:

- ✅ Running
- ✅ Connected to database
- ✅ Ready for API endpoints
- ✅ Fully testable

**Next:** Build the actual API endpoints (signup, login, portfolios, etc.)!

---

**📚 Learn More:**

- FastAPI Docs: https://fastapi.tiangolo.com
- Swagger UI: https://swagger.io/tools/swagger-ui/
- PostgreSQL: https://www.postgresql.org/docs/
