@echo off
title AcneGuard AI Launcher
echo ========================================================
echo  Launching AcneGuard AI Fullstack Platform
echo ========================================================
echo [1/2] Starting Backend in a separate window...
start "AcneGuard Backend" cmd /c "call "%~dp0run_backend.bat""
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo [2/2] Starting Frontend in a separate window...
start "AcneGuard Frontend" cmd /c "call "%~dp0run_frontend.bat""
echo.
echo ========================================================
echo  Two separate console windows have opened!
echo.
echo  1. Backend Window: Wait until it prints:
echo     "Application startup complete" on http://127.0.0.1:8000
echo.
echo  2. Frontend Window: Wait until it prints:
echo     "Local: http://localhost:5173/"
echo.
echo  Once both are ready, open http://localhost:5173
echo ========================================================
echo.
pause
