@echo off
title AcneGuard Backend Server
echo ==============================================
echo  Starting AcneGuard AI Backend (FastAPI)
echo ==============================================
cd /d "%~dp0backend"

set PY_CMD=python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    py --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PY_CMD=py
    ) else (
        echo.
        echo [ERROR] Python was not found in your system PATH!
        echo Please install Python 3.10+ from https://www.python.org/
        echo (Make sure to check "Add Python to PATH" during installation)
        echo.
        pause
        exit /b 1
    )
)

echo Python environment detected:
%PY_CMD% --version

%PY_CMD% -c "import fastapi, uvicorn" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installing backend dependencies (FastAPI, Uvicorn, etc.)...
    %PY_CMD% -m pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-multipart python-dotenv pyjwt passlib bcrypt pillow numpy
)

echo.
echo Starting Uvicorn server on http://127.0.0.1:8000 ...
echo (Keep this window open while using AcneGuard)
echo.
%PY_CMD% -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
