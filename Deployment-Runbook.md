# 🚀 Tasky Production Deployment Runbook

Complete end-to-end guide for deploying the **FastAPI Backend (Cloud / Docker)** and building the **React Native Standalone Android APK**.

---

## 📋 Part 1: Backend Deployment (Render / Railway / Docker)

### Option A: 1-Click Deploy on Render (Recommended Free Tier)

1. **Push your code to GitHub**:
   ```powershell
   git add .
   git commit -m "feat: configure production deployment"
   git push origin main
   ```

2. **Deploy via Render Blueprint**:
   - Go to **[dashboard.render.com](https://dashboard.render.com)** $\rightarrow$ Click **New +** $\rightarrow$ **Blueprint**.
   - Connect your GitHub repository.
   - Render automatically reads [`Tasky-Backend/render.yaml`](file:///c:/Users/BRIAN/Documents/MY%20SYSTEM/Mobile%20Development/Task-Management-App/Tasky-Backend/render.yaml) and provisions:
     - **Free PostgreSQL Database** (`tasky-db`)
     - **Free FastAPI Web Service** (`tasky-backend`)
   - Click **Apply**.
   - Your live API URL will be ready at `https://tasky-backend.onrender.com`.

3. **Verify Deployment**:
   ```bash
   curl https://tasky-backend.onrender.com/health
   # Expected Output: {"status":"ok","app":"Tasky","version":"1.0.0","environment":"production"}
   ```

---

### Option B: Deploy via Railway

1. Install the Railway CLI (optional) or open **[railway.app](https://railway.app)**.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Add a **PostgreSQL** database service.
4. Set the environment variable:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `PORT` = `8000`
5. Railway automatically builds the [`Dockerfile`](file:///c:/Users/BRIAN/Documents/MY%20SYSTEM/Mobile%20Development/Task-Management-App/Tasky-Backend/Dockerfile) and assigns a public domain `https://your-service.up.railway.app`.

---

### Option C: Local / VPS Docker Compose Deployment

```powershell
cd Tasky-Backend
docker-compose up -d --build
```
Check health: `http://localhost:8000/health`

---

## 📱 Part 2: Standalone Android APK Generation (EAS Build)

### Step 1: Install EAS CLI
In your root terminal:
```powershell
npm install -g eas-cli
```

### Step 2: Log into Expo / EAS
```powershell
eas login
```
*(If you don't have an Expo account, register for free at [expo.dev](https://expo.dev)).*

### Step 3: Link Project to EAS
In the `Tasky` frontend directory:
```powershell
cd Tasky
eas project:init
```

### Step 4: Set Production API URL
In `Tasky/.env.production` or when running EAS:
```env
EXPO_PUBLIC_API_URL=https://tasky-backend.onrender.com/api
```

### Step 5: Build the Standalone APK
Run the EAS APK build command:
```powershell
eas build -p android --profile preview
```
- EAS Cloud will compile your React Native app.
- When the build finishes, EAS provides a **direct download link & QR Code** for your **`Tasky.apk`**.
- Download and install the `.apk` file directly on any Android device!

---

## 🔍 Verification Checklist

- [x] Backend multi-stage Docker build under 150 MB.
- [x] Universal health check at `/health` and `/api/health`.
- [x] CORS dynamic origin resolution (`ALLOWED_ORIGINS=*`).
- [x] Automatic database URL adapter for cloud asyncpg (`postgres://` $\rightarrow$ `postgresql+asyncpg://`).
- [x] EAS preview profile configured with `"buildType": "apk"`.
- [x] App package name set to `com.brian.tasky` with all necessary mobile permissions.
