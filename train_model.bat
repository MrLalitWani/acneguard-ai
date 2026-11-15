@echo off
title AcneGuard Clinical AI Model Training
echo ========================================================
echo   AcneGuard AI - Clinical Skin Assessment Training
echo ========================================================
cd /d "%~dp0backend"

:: Detect Python
set PY_CMD=python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    py --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PY_CMD=py
    ) else (
        echo [ERROR] Python not found in system PATH.
        pause
        exit /b 1
    )
)

echo Python Environment:
%PY_CMD% --version

:: Check for PyTorch and Torchvision
echo.
echo [*] Checking PyTorch and Torchvision installation...
%PY_CMD% -c "import torch, torchvision; print('PyTorch Version:', torch.__version__, '| CUDA Available:', torch.cuda.is_available())" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] PyTorch is not installed. Installing PyTorch and Torchvision now...
    echo (This may take a few minutes depending on your internet connection)
    %PY_CMD% -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
)

:: Check if dataset exists, if not bootstrap it
if not exist "data\train\Clear" (
    echo.
    echo [*] No dataset found. Initializing clinical dataset structure and bootstrap samples...
    %PY_CMD% prepare_dataset.py --bootstrap-samples 50
)

echo.
echo ========================================================
echo   Starting PyTorch ResNet-18 Transfer Learning Engine
echo ========================================================
echo.
%PY_CMD% app\ml\train.py --epochs 15 --batch-size 16 --data-dir "data" --output "app\ml\weights\acne_resnet18.pth"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Model training complete!
    echo   Weights saved to: backend\app\ml\weights\acne_resnet18.pth
    echo   Your FastAPI server will now automatically use the
    echo   trained deep learning neural network for skin scans.
    echo ========================================================
) else (
    echo.
    echo [ERROR] Training was interrupted or encountered an error.
)

pause
