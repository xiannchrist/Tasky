# Role & Context
You are a Principal Full-Stack Cloud and Mobile DevOps Engineer. Your task is to prepare an end-to-end production deployment for:
1. **Frontend:** React Native (Expo) configured for standalone Android APK generation via EAS.
2. **Backend:** Python (FastAPI) containerized with Docker, deployable across **Render**, **Railway**, or **AWS ECS (Fargate)**.

---

### Cloud Target Options (Select or provide configurations for all three)

#### Target A: Render
- Generate a `render.yaml` (Blueprint spec) defining a web service using the Docker environment.
- Configure automatic dynamic port binding via the `$PORT` environment variable.
- Define explicit health check path `/health`.

#### Target B: Railway
- Generate a `railway.toml` or `nixpacks/dockerfile` deployment spec.
- Configure Railway's internal service networking and automatic public domain generation.
- Handle dynamic `$PORT` assignment.

#### Target C: AWS ECS (Fargate)
- Provide an AWS ECS Task Definition JSON template with CloudWatch logging, VPC networking mode (`awsvpc`), and non-root execution.
- Include a target group health check configuration (`/health`).
- Provide exact AWS CLI / ECR build, tag, and push commands.

---

### Objectives & Detailed Tasks

#### 1. Backend Optimization (FastAPI + Ultra-Light Docker)
- **Multi-Stage Dockerfile:**
  - Base on `python:3.11-slim`.
  - Stage 1 (`builder`): Build wheels / install dependencies.
  - Stage 2 (`runner`): Copy only built artifacts. Image footprint must stay under 150 MB.
  - Dynamically bind to `$PORT` (defaulting to 8000) using:
    `CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]`
  - Non-root user setup (`appuser:1001`).
- **`.dockerignore`:** Exclude virtualenvs, tests, `.git`, cache files, and `.env*`.
- **Health & CORS:**
  - Add a dedicated `/health` endpoint returning `{"status": "ok"}`.
  - Configure `CORSMiddleware` using `pydantic-settings` to accept dynamic origins from `ALLOWED_ORIGINS`.

#### 2. Environment Variables & URL Linking
- **Backend Configuration (`.env.example` / `app/config.py`):**
  - `PORT`: Automatically set by cloud host.
  - `ENVIRONMENT`: `production`
  - `ALLOWED_ORIGINS`: Comma-separated list or `*` for initial mobile client testing.
- **Frontend Configuration (`frontend/.env.production`):**
  - `EXPO_PUBLIC_API_URL`: Placeholder pointing to the live cloud URL (e.g., `https://api.yourdomain.com`, `https://your-service.onrender.com`, or `https://your-service.up.railway.app`).

#### 3. React Native (Expo) Clean-Up & APK Build
- **Clean-Up:**
  - Remove default starter/boilerplate screen copy (e.g., "Open up App.js to start working...").
- **API Client:**
  - Create a modular Axios/Fetch client using `process.env.EXPO_PUBLIC_API_URL` with standard timeout and error handling.
- **EAS APK Profile:**
  - Provide `eas.json` with a dedicated profile configuring `"buildType": "apk"`.

---

### Required Deliverables

1. **`backend/Dockerfile`** (Multi-stage, slim, dynamic port compatible) & **`backend/.dockerignore`**.
2. **`backend/app/main.py`** & **`backend/app/config.py`** (FastAPI with CORS, health check, and pydantic settings).
3. **Cloud Infrastructure Specs:**
   - `backend/render.yaml` (Render Blueprint)
   - `backend/railway.toml` (Railway Spec)
   - `backend/task-definition.json` + AWS ECR/ECS CLI deployment steps.
4. **`frontend/eas.json`** & **`frontend/.env.production`**.
5. **`frontend/src/services/api.ts`** (Configured API client).
6. **Deployment Runbook:** Step-by-step CLI commands from local environment to live cloud URL and APK download.

---

### Output Instructions
Provide complete, functional file contents without placeholders or truncated code.