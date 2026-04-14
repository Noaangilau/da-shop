# Workflow: Deploy to Railway

## Objective
Deploy the DA SHOP frontend and backend to Railway via GitHub.

## Pre-Deploy Checklist
- [ ] .env is NOT committed (check .gitignore)
- [ ] All env vars are set in Railway dashboard
- [ ] Frontend VITE_API_URL points to Railway backend URL
- [ ] Backend FRONTEND_ORIGIN points to Railway frontend URL
- [ ] App runs locally without errors (both frontend and backend)

## Backend Deployment (FastAPI)
1. Push code to GitHub
2. In Railway: New Project → Deploy from GitHub repo → select `/backend` as root
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Railway dashboard:
   - DATABASE_URL (Railway will provide if using Railway Postgres, else use SQLite path)
   - FRONTEND_ORIGIN (set after frontend is deployed)
6. Railway uses Nixpacks — it will auto-detect Python

## Frontend Deployment (React + Vite)
1. In Railway: New Service → Deploy from GitHub → select `/frontend` as root
2. Set build command: `npm install && npm run build`
3. Set start command: `npx serve dist`
4. Add environment variables:
   - VITE_API_URL=https://[your-backend-railway-url]
5. After deploy, copy the frontend URL and update FRONTEND_ORIGIN in backend service

## Post-Deploy
- Visit the live URL and test the Become a Vendor form end-to-end
- Check the /health endpoint on the backend
- Confirm vendor_inquiries table is being written to

## Environment Variables Summary
| Variable | Service | Value |
|---|---|---|
| DATABASE_URL | Backend | sqlite:///./dashop.db or Railway Postgres URL |
| FRONTEND_ORIGIN | Backend | https://[frontend.railway.app] |
| VITE_API_URL | Frontend | https://[backend.railway.app] |
