@echo off
title AstroSight Launcher
echo ========================================================
echo   Launching AstroSight: AI Planetary Analysis Platform
echo ========================================================
echo.
echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "AstroSight Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Frontend on http://localhost:5173 ...
start "AstroSight Frontend (Vite/React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo Opening AstroSight Mission Control in browser...
start http://localhost:5173

echo.
echo ========================================================
echo   AstroSight is now running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================================
