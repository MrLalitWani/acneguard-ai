# AcneGuard AI - Clinical Acne Severity & Lifestyle Analysis Platform

A full-stack diagnostic application leveraging **PyTorch ResNet-18** computer vision and a **multi-factor lifestyle risk engine** to classify facial acne severity, detect lesion patterns across facial quadrants, and analyze dietary and environmental triggers.

---

## 🚀 Quick Start (One-Click)

Double-click `run_all.bat` or run:
```cmd
.\run_all.bat
```
This automatically starts both the FastAPI backend and Vite frontend in separate terminal windows.

---

## 🛠 Manual Execution

### 1. Backend (FastAPI + PyTorch)
```cmd
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Database**: SQLite (`backend/acneguard.db` auto-created on first run)

### 2. Frontend (React 18 + Vite + TailwindCSS)
```cmd
cd frontend
npm install
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)

---

## 📦 Features

- **Computer Vision Skin Scan**:
  - Live webcam snapshot or high-resolution photo upload.
  - Facial quadrant erythema & redness variance analysis (Forehead, Cheeks, Chin).
  - 4 Severity classifications (`Clear`, `Mild`, `Moderate`, `Severe`).
- **Diet & Lifestyle Trigger Engine**:
  - Identifies glycemic load, dairy consumption, hydration deficit, sleep deprivation, and stress spikes.
  - Actionable clinical recommendations and routine guidance.
- **Export & Progress Tracking**:
  - PDF diagnostic report export (via html2canvas & jsPDF).
  - Assessment history and timeline log with SQLite persistence.
- **Secure Authentication**:
  - JWT tokens with bcrypt password hashing.
  - In-app profile management and password reset flow.

---

## 🚢 Production Deployment (Docker Compose)

Deploy the entire production stack (Nginx + Gunicorn/Uvicorn + PostgreSQL 16) with one command:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
See [DEPLOYMENT.md](file:///c:/Users/lalit/OneDrive/Desktop/AcneGuard/DEPLOYMENT.md) for full configuration, SSL setup, and backup procedures.
