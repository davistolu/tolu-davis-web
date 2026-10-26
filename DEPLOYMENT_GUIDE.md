# 🚀 Vercel Full-Stack Deployment Guide

This project is configured as a full-stack monorepo with an **isolated React + Vite SPA** (`frontend/`) and a **serverless-ready Express REST API** (`backend/`).

---

## 🌟 What Was Prepared For You

1. **`vercel.json` (Root)**:
   - Directs Vercel to run `npm run build:all`
   - Serves frontend static assets from `frontend/dist`
   - Automatically routes `/api/(.*)` and `/health` requests to the Serverless Express API
   - Sets up clean client-side SPA routing (`/index.html`)

2. **`api/index.ts` (Vercel Serverless Function)**:
   - Wraps the Express backend into an auto-scaling AWS Lambda function managed by Vercel
   - Handles cold starts, lazy database initialization, and zero-downtime requests

3. **Serverless-Safe Database Layer (`backend/src/db/db.ts`)**:
   - Works with managed cloud PostgreSQL clusters (Neon, Supabase, Vercel Postgres, AWS RDS, Render)
   - Automatically enables SSL (`rejectUnauthorized: false`) for cloud databases
   - Includes in-memory fallback in `/tmp` so the app **never crashes** even if the database is offline or not configured yet

4. **Dynamic API Routing (`frontend/src/utils/api.ts`)**:
   - Works seamlessly on the exact same domain (`/api`) with zero CORS configuration
   - Supports optional `VITE_API_URL` if you ever want to decouple frontend and backend

---

## 📋 Recommended Strategy: Deploy Frontend First, Then Backend

You can deploy the frontend and backend as two separate services on Vercel (or frontend on Vercel + backend on Render/Railway), and link them using their live URLs.

---

### Step 1: Deploy the Frontend on Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: configure independent frontend and backend deployments"
   git push origin main
   ```
2. **Go to [vercel.com](https://vercel.com) & Import your repository**:
   - Click **"Add New..."** &rarr; **"Project"** &rarr; select this repository.
3. **Configure Project Settings**:
   - **Project Name**: `toluwanimi-portfolio` (or `tolu-frontend`)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select **`frontend`** (or type `frontend`)
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
4. **Click "Deploy"**:
   - Vercel will build and launch your frontend.
   - **Save your frontend live URL** (e.g., `https://tolu-frontend.vercel.app`).

---

### Step 2: Deploy the Backend on Vercel (or Render / Railway)

#### Option A: Deploying Backend on Vercel
1. On Vercel, click **"Add New..."** &rarr; **"Project"** &rarr; select the same GitHub repository again.
2. **Configure Settings**:
   - **Project Name**: `toluwanimi-portfolio-api` (or `tolu-backend`)
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and select **`backend`** (or type `backend`)
3. **Set Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `CLIENT_URL` | `https://tolu-frontend.vercel.app` | The frontend URL from Step 1 |
   | `DATABASE_URL` | `postgresql://...` | Cloud PostgreSQL URI (Neon / Supabase) |
   | `JWT_SECRET` | `super-secret-cyber-jwt-key-2026-toluwanimi-davis` | Token signing secret |
   | `ADMIN_USERNAME` | `admin` | Owner username |
   | `ADMIN_PASSWORD` | `tolu-admin-2026` | Master passphrase for `~/admin.sh` |
   | `NODE_ENV` | `production` | Production mode |
4. **Click "Deploy"**:
   - **Save your backend live URL** (e.g., `https://tolu-backend.vercel.app`).

#### Option B: Deploying Backend on Render (Alternative Web Service)
1. Go to [render.com](https://render.com) &rarr; **New Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory**: `backend`.
4. Set **Build Command**: `npm run build`.
5. Set **Start Command**: `npm run start`.
6. Add the environment variables (`CLIENT_URL`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`).
7. Save your live backend URL (e.g. `https://tolu-backend.onrender.com`).

---

### Step 3: Connect Frontend to Backend

Now that your backend is live:
1. Go back to your **Frontend** project on Vercel.
2. Navigate to **Settings** &rarr; **Environment Variables**.
3. Add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://tolu-backend.vercel.app` *(or your Render URL)* |
4. Go to the **Deployments** tab &rarr; click the three dots (`...`) on your latest deployment &rarr; click **Redeploy** (or push a commit).

Your frontend will now fetch live projects, skills, timeline data, and route contact messages directly to your backend!

---

## 🗄️ Setting Up Cloud PostgreSQL (Neon / Supabase)

> [!NOTE]
> Since `localhost:5432` only runs on your local machine, a cloud-accessible PostgreSQL database is needed to persist edits in production.

### Quick Setup with Neon (Free & Instant)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Click **"Create Project"** &rarr; Name it `portfolio-db`.
3. Copy the **Connection String** (e.g. `postgresql://neondb_owner:***@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).
4. Paste it into your Backend's `DATABASE_URL` environment variable.
5. On the first API request, the backend will automatically create tables and seed your projects, skills, profile, and FAQ data into Neon.

---

## 🔒 Owner Dashboard Access in Production

1. Visit your live frontend URL.
2. Click **`[🔒 Admin]`** in the top navigation bar, click tab **`13:admin.sh`**, or execute in the terminal:
   ```bash
   admin
   ```
3. Enter your configured `ADMIN_PASSWORD` (default: `tolu-admin-2026`).
4. You now have full management control over your live cloud database directly from your deployed portfolio!

