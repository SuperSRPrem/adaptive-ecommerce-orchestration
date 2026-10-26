# PowerShell Startup Script for Adaptive E-Commerce Orchestration
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " [SearchLab] Launching Complete Research Platform (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$BackendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload" -PassThru

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
$FrontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm.cmd run dev -- --host 0.0.0.0 --port 5173" -PassThru

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " [SUCCESS] Application services are active!" -ForegroundColor Cyan
Write-Host "   Frontend Website:  http://localhost:5173/" -ForegroundColor Yellow
Write-Host "   Backend API Docs:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "   Backend Health:    http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "   Researcher View:   http://localhost:5173/researcher" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
