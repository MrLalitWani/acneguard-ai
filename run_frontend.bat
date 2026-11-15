@echo off
title AcneGuard Frontend Server
echo ==============================================
echo  Starting AcneGuard AI Frontend (Vite + React)
echo ==============================================
cd /d "%~dp0frontend"

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please install Node.js (LTS version) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js environment detected:
node --version
echo npm version:
call npm --version

if not exist node_modules (
    echo.
    echo Installing npm dependencies... Please wait a moment.
    call npm install
)

echo.
echo Starting Vite development server on http://localhost:5173 ...
echo (Keep this window open while using AcneGuard)
echo.
call npm run dev -- --host
pause
