@echo off
setlocal
echo ==============================================================================
echo [SearchLab] Starting Adaptive E-Commerce Vite Frontend (Port 5173)...
echo ==============================================================================

cd /d "%~dp0..\frontend"

REM Check if npm is available
where npm.cmd >nul 2>nul
if %errorlevel% neq 0 (
    where npm >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Node.js / npm not found in system PATH. Please install Node.js 18+ and retry.
        pause
        exit /b 1
    )
    set NPM_CMD=npm
) else (
    set NPM_CMD=npm.cmd
)

echo Working Directory: %CD%
echo Web App UI:        http://localhost:5173/
echo.

call %NPM_CMD% run dev -- --host 0.0.0.0 --port 5173
if %errorlevel% neq 0 (
    echo [ERROR] Frontend failed to start.
    pause
)
