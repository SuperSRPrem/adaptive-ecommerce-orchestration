@echo off
setlocal
echo ==============================================================================
echo [SearchLab] Launching Complete Research Platform (Backend + Frontend)
echo ==============================================================================
echo.
echo 1. Starting FastAPI Backend Server on http://localhost:8000 ...
start "SearchLab Backend (Port 8000)" cmd /k "%~dp0start-backend.bat"

echo 2. Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo 3. Starting Vite Frontend Server on http://localhost:5173 ...
start "SearchLab Frontend (Port 5173)" cmd /k "%~dp0start-frontend.bat"

echo.
echo ==============================================================================
echo [SUCCESS] Both services launched in separate windows!
echo.
echo   Frontend Website:    http://localhost:5173/
echo   Backend Health:      http://localhost:8000/health
echo   API Swagger Docs:    http://localhost:8000/docs
echo   Researcher View:     http://localhost:5173/researcher
echo.
echo Close individual process windows to stop each service.
echo ==============================================================================
