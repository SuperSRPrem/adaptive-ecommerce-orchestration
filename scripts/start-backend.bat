@echo off
setlocal
echo ==============================================================================
echo [SearchLab] Starting Adaptive E-Commerce FastAPI Backend (Port 8000)...
echo ==============================================================================

cd /d "%~dp0..\backend"

REM Check if Python is available
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in system PATH. Please install Python 3.10+ and retry.
    pause
    exit /b 1
)

echo Working Directory: %CD%
echo FastAPI Swagger UI: http://localhost:8000/docs
echo Health Check:      http://localhost:8000/health
echo.

python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
if %errorlevel% neq 0 (
    echo [ERROR] Backend failed to start.
    pause
)
