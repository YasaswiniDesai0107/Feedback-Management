# 📋 Feedback Management System — Backend API

> **Phase 1 | Backend Foundation**  
> A clean, modular REST API built with FastAPI, SQLAlchemy, and MySQL.

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI app entry point
│   ├── database.py                 # DB engine, session, Base
│   ├── config/
│   │   └── settings.py             # .env settings loader
│   ├── models/
│   │   └── feedback_model.py       # SQLAlchemy ORM model
│   ├── schemas/
│   │   └── feedback_schema.py      # Pydantic request/response schemas
│   ├── crud/
│   │   └── feedback_crud.py        # Raw DB operations (Create/Read/Update/Delete)
│   ├── routers/
│   │   └── feedback_router.py      # HTTP route definitions
│   └── services/
│       └── feedback_service.py     # Business logic & HTTP exception handling
├── requirements.txt                # Python dependencies
├── schema.sql                      # MySQL table definition + sample data
├── .env                            # Environment variables (NOT committed to Git)
├── .gitignore                      # Files excluded from Git
└── README.md                       # This file
```

---

## 🧱 Architecture Overview

```
HTTP Request
    │
    ▼
[Router]          ← Handles HTTP, calls Service
    │
    ▼
[Service Layer]   ← Business logic, raises HTTP errors
    │
    ▼
[CRUD Layer]      ← Raw SQLAlchemy database operations
    │
    ▼
[MySQL Database]
```

---

## ⚙️ Prerequisites

| Tool     | Version   | Download |
|----------|-----------|----------|
| Python   | 3.10+     | [python.org](https://python.org) |
| MySQL    | 8.0+      | [mysql.com](https://dev.mysql.com/downloads/) |
| pip      | Latest    | Included with Python |

---

## 🚀 Setup Instructions

### Step 1 — Clone the repository
```bash
git clone https://github.com/<your-username>/feedback-management-system.git
cd feedback-management-system/backend
```

### Step 2 — Create a Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Configure environment variables
```bash
# The .env file is already in the backend/ folder.
# Open it and fill in YOUR MySQL credentials:
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=feedback_db
DEBUG=True
```

### Step 5 — Set up the MySQL database
```bash
# Option A: Run the SQL script manually
mysql -u root -p < schema.sql

# Option B: Just create the DB — SQLAlchemy will auto-create the table on startup
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS feedback_db;"
```

### Step 6 — Start the server
```bash
# From the backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 7 — Verify the API is running
Open your browser:
- **Health Check**: http://localhost:8000/
- **Swagger UI**: http://localhost:8000/docs  ← Interactive API explorer
- **ReDoc UI**: http://localhost:8000/redoc

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/feedback/` | Get all feedback records |
| `GET` | `/api/v1/feedback/{id}` | Get a single feedback by ID |
| `POST` | `/api/v1/feedback/` | Submit new feedback |
| `PUT` | `/api/v1/feedback/{id}` | Update existing feedback |
| `DELETE` | `/api/v1/feedback/{id}` | Delete feedback by ID |

---

## 🧪 API Testing Examples

### Create feedback (POST)
```bash
curl -X POST "http://localhost:8000/api/v1/feedback/" \
     -H "Content-Type: application/json" \
     -d '{
           "participant_name": "Alice Johnson",
           "program_name": "Data Science Bootcamp",
           "rating": 5,
           "comments": "Excellent program with practical projects!"
         }'
```

### Get all feedback (GET)
```bash
curl "http://localhost:8000/api/v1/feedback/"
```

### Get feedback by ID (GET)
```bash
curl "http://localhost:8000/api/v1/feedback/1"
```

### Update feedback (PUT)
```bash
curl -X PUT "http://localhost:8000/api/v1/feedback/1" \
     -H "Content-Type: application/json" \
     -d '{"rating": 4, "comments": "Updated: Great but could improve pacing."}'
```

### Delete feedback (DELETE)
```bash
curl -X DELETE "http://localhost:8000/api/v1/feedback/1"
```

---

## 📊 Database Schema

```sql
TABLE: feedbacks

┌─────────────────┬──────────────┬──────────────────────────────────────────┐
│ Column          │ Type         │ Description                              │
├─────────────────┼──────────────┼──────────────────────────────────────────┤
│ feedback_id     │ INT (PK, AI) │ Auto-incremented unique ID               │
│ participant_name│ VARCHAR(150) │ Submitter's name (required)              │
│ program_name    │ VARCHAR(200) │ Program/course name (required)           │
│ rating          │ INT          │ Rating 1–5 (required, validated)         │
│ comments        │ TEXT         │ Optional free-text feedback              │
│ submitted_at    │ DATETIME     │ Auto-set timestamp on creation           │
└─────────────────┴──────────────┴──────────────────────────────────────────┘
```

---

## 🏷️ Recommended Git Commit Messages

```bash
# After Step 1 — Initial setup
git commit -m "feat: initialize FastAPI project with modular folder structure"

# After database setup
git commit -m "feat: add SQLAlchemy database connection and session management"

# After models
git commit -m "feat: add Feedback SQLAlchemy ORM model with rating constraint"

# After schemas
git commit -m "feat: add Pydantic schemas for feedback validation and serialization"

# After CRUD
git commit -m "feat: implement CRUD operations for feedback database layer"

# After service layer
git commit -m "feat: add service layer with business logic and HTTP exception handling"

# After router
git commit -m "feat: add feedback API router with 5 CRUD endpoints"

# After main.py
git commit -m "feat: configure FastAPI app with CORS middleware and router registration"

# After config files
git commit -m "chore: add requirements.txt, .env, .gitignore, schema.sql, and README"

# Final Phase 1 tag
git tag -a v1.0.0 -m "Phase 1: Backend Foundation Complete"
```

---

## 🔒 Security Notes

- ✅ Never commit `.env` to GitHub — it's in `.gitignore`
- ✅ Use environment variables for all credentials
- ✅ Rating validated at both Pydantic (API) and DB constraint level
- ⚠️ CORS is open (`*`) for development — restrict in production

---

## 🗺️ What's Coming Next

| Phase | Description |
|-------|-------------|
| Phase 2 | Search, filter, and pagination APIs |
| Phase 3 | Authentication & authorization (JWT) |
| Phase 4 | Frontend (React or plain HTML/JS) |
| Phase 5 | Deployment (Docker + cloud) |

---

*Built as an academic assignment project demonstrating clean software engineering practices.*
