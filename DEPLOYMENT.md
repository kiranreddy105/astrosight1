# ASTROSIGHT — 24/7 Production Deployment & Cloud Publishing Guide

This guide walks you through publishing the **AstroSight** platform to modern cloud container providers so it runs **24/7 continuously with zero manual server maintenance**.

---

## 🚀 Recommended Cloud Deployment Options

| Provider | Type | 24/7 Uptime | Persistent Storage | Ease of Setup |
|:---|:---|:---:|:---:|:---:|
| **Render** | Cloud Container Platform | ✅ Yes | ✅ Persistent Disk | ⭐⭐⭐⭐⭐ Easiest |
| **Railway** | Cloud Infrastructure | ✅ Yes | ✅ Volume Mounts | ⭐⭐⭐⭐⭐ Very Easy |
| **Fly.io** | Global Edge Containers | ✅ Yes | ✅ Fly Volumes | ⭐⭐⭐⭐ Developer Friendly |
| **Cloud VPS (DigitalOcean / Hetzner / AWS)** | Dedicated Linux VM | ✅ Yes | ✅ Host Volumes | ⭐⭐⭐ Full Control |

---

## OPTION 1: 1-Click Cloud Deployment on Render (Recommended)

Render provides automated Docker container hosting with continuous deployment from GitHub and auto-restarting services.

### Step 1: Push Project to GitHub
1. Create a private or public repository on [GitHub](https://github.com/new) named `astrosight`.
2. Initialize git and push the workspace:
   ```bash
   git init
   git add .
   git commit -m "feat: AstroSight 24/7 production release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/astrosight.git
   git push -u origin main
   ```

### Step 2: Deploy Using Blueprint (`render.yaml`)
1. Log in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository `astrosight`.
4. Render will automatically detect the [`render.yaml`](./render.yaml) file and provision:
   - **`astrosight-api`**: FastAPI + PyTorch Docker service with 5 GB persistent disk mounted at `/app/data`.
   - **`astrosight-client`**: High-performance React + Nginx web application.
5. Click **Apply**.
6. Render builds both containers and assigns free HTTPS URLs (e.g., `https://astrosight-client.onrender.com`).

---

## OPTION 2: Deploying to Railway

Railway auto-detects Dockerfiles and builds containers with zero configuration.

1. Go to [Railway.app](https://railway.app) and click **New Project**.
2. Select **Deploy from GitHub repo** and choose `astrosight`.
3. Add two services from the same repo:
   - **Backend Service**:
     - Root Directory: `/backend`
     - Dockerfile Path: `/backend/Dockerfile`
     - Add Volume: Mount `/app/data` (to persist users and database)
   - **Frontend Service**:
     - Root Directory: `/frontend`
     - Dockerfile Path: `/frontend/Dockerfile`
     - Set Environment Variable: `BACKEND_URL=https://your-backend-railway-url.up.railway.app`
4. Click **Deploy**. Railway provisions SSL certificates and keeps your services running 24/7.

---

## OPTION 3: 24/7 Self-Hosted VPS Deployment (Docker Compose)

For deployment on any Linux Virtual Private Server (Ubuntu 22.04 / 24.04, Debian, DigitalOcean Droplet, AWS EC2, or Hetzner):

### 1. Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

### 2. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/astrosight.git /opt/astrosight
cd /opt/astrosight
```

### 3. Launch Services in Background
```bash
# Start backend and frontend with auto-restart on boot
docker compose up -d --build
```

### 4. Verify Active Containers
```bash
docker compose ps
```
Both containers will report `Up` with `healthy` status.

### 5. View Real-Time Logs
```bash
docker compose logs -f
```

---

## 🛡️ 24/7 Monitoring & Automated Health Checks

The backend includes an active health monitoring endpoint at `/api/health` that reports:
```json
{
  "status": "OPERATIONAL",
  "system": "AstroSight Planetary Intelligence Node",
  "version": "2.4.0",
  "core": "PyTorch / OpenCV / FastAPI",
  "uptime_seconds": 8420.5,
  "mode": "PRODUCTION_24_7"
}
```

### Setup Free Uptime Monitoring (Optional)
To receive alerts if your server ever goes down:
1. Create a free account at [UptimeRobot](https://uptimerobot.com) or [Better Stack](https://betterstack.com).
2. Add a new HTTP Monitor pointing to:
   `https://your-app-domain.com/api/health`
3. Set the check interval to **5 minutes**.
4. Configure notifications via Email, Discord, or Slack.

---

## 🔒 Custom Domain & SSL (HTTPS) Setup

To connect your custom domain (e.g., `astrosight.org`):

### If using Render or Railway:
1. Go to your frontend service settings $\rightarrow$ **Custom Domains**.
2. Add `astrosight.org` and `www.astrosight.org`.
3. Add the displayed CNAME records in your DNS provider (Cloudflare, GoDaddy, Namecheap).
4. SSL certificates are provisioned and renewed automatically via Let's Encrypt at no cost.

---

## 💾 Persistent Data & Backup Policy

All mission state is persisted in three dedicated mount points:
- `/app/data/astrosight.db`: SQLite database containing researcher accounts, passwords, and analysis metadata.
- `/app/uploads`: Uploaded planetary images.
- `/app/reports`: Generated aerospace PDF dossier reports.

To create an offline backup of your database:
```bash
# On your server / Docker host:
docker cp astrosight-backend:/app/data/astrosight.db ./astrosight_backup_$(date +%F).db
```
