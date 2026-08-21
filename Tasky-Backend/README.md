# Tasky Backend

Multi-user academic task management backend with LMS synchronization.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy 2.x (async)
- **Auth**: JWT (access + refresh tokens) with bcrypt password hashing
- **Migrations**: Alembic
- **Background Jobs**: APScheduler (dev) / Celery + Redis (prod)
- **LMS Integration**: Adapter pattern with httpx + BeautifulSoup
- **Notifications**: Firebase Cloud Messaging (Phase 5)

## Quick Start (Local Development)

### 1. Prerequisites

- Python 3.12+
- PostgreSQL running locally (or use Docker)
- Redis (optional, for production worker)

### 2. Setup

```bash
# Navigate to backend
cd Tasky-Backend

# Activate virtual environment
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Copy env template
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env with your database credentials
# notepad .env

# Install dependencies (if not already done)
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Create the database
# In PostgreSQL:
# CREATE DATABASE tasky_db;
# CREATE USER tasky_user WITH PASSWORD 'tasky_password';
# GRANT ALL PRIVILEGES ON DATABASE tasky_db TO tasky_user;

# Run migrations
alembic upgrade head

# Or for first-time auto-create (dev only):
# Tables are auto-created on startup in debug mode
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/api/health

## Quick Start (Docker)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/tasks/sync` | Bulk sync from mobile |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List subjects |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/{id}` | Update subject |
| DELETE | `/api/subjects/{id}` | Delete subject |

### LMS Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lms/connect` | Connect LMS account |
| DELETE | `/api/lms/disconnect` | Disconnect LMS |
| GET | `/api/lms/status` | Get sync status |
| POST | `/api/lms/sync` | Manual sync trigger |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/devices` | Register push token |
| DELETE | `/api/devices/{id}` | Unregister device |

## Project Structure

```
Tasky-Backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── core/                # Config, security, dependencies
│   ├── db/                  # Database engine & session
│   ├── models/              # SQLAlchemy models (6)
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API endpoints (7 routers)
│   ├── services/            # Business logic
│   ├── lms/                 # LMS adapter abstraction
│   └── workers/             # Background jobs
├── alembic/                 # Database migrations
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Development Phases

- [x] **Phase 1**: Backend foundation (FastAPI, PostgreSQL, Auth, CRUD)
- [ ] **Phase 2**: Mobile integration (Login, Register, JWT, API clients)
- [ ] **Phase 3**: LMS connection (Adapter, Parser, Manual Sync)
- [ ] **Phase 4**: Automatic synchronization (Background worker)
- [ ] **Phase 5**: Notifications (FCM, Device registration)
- [ ] **Phase 6**: Offline sync (Local cache, Conflict handling)
- [ ] **Phase 7**: Deployment (Docker, NGINX, HTTPS)
