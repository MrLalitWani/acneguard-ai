# AcneGuard AI - Production Deployment & Operations Guide

This guide covers everything required to deploy, secure, and monitor **AcneGuard AI** in a high-concurrency production cloud environment.

---

## 1. Architecture Overview

```
                      HTTPS / Port 443
                            │
                            ▼
              ┌───────────────────────────┐
              │   Nginx Reverse Proxy     │
              │  (Gzip, Cache, SSL, WAF)  │
              └─────────────┬─────────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
    Static React SPA Assets         API Routes (/api/*)
    (Cached in Browser/CDN)                │
                                           ▼
                            ┌─────────────────────────────┐
                            │    Gunicorn Master (x4)     │
                            │      Uvicorn Workers        │
                            └──────────────┬──────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │  PostgreSQL 16 (Pooled)     │
                            │  + PyTorch ResNet-18 Model  │
                            └─────────────────────────────┘
```

---

## 2. Quick Deploy with Docker Compose (Recommended)

### Prerequisites:
- Docker Engine 24.0+
- Docker Compose v2.20+

### Steps:

1. **Configure Environment Variables**:
   Copy the production environment template:
   ```bash
   cp backend/.env.example .env
   ```
   Generate a cryptographically secure JWT secret key:
   ```bash
   openssl rand -hex 32
   ```
   Paste the generated string into `SECRET_KEY` in `.env`.

2. **Build and Launch Containers**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verify Health**:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
   Test the health check probe:
   ```bash
   curl http://localhost/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "AcneGuard AI",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

4. **Stop Containers**:
   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

---

## 3. Database Maintenance (PostgreSQL)

### Automatic Pooling
Connection pooling is enabled by default in `backend/app/database.py`:
- `pool_size`: 10 connections per worker
- `max_overflow`: 20 burst connections
- `pool_pre_ping`: Automatic stale connection eviction

### Backup Database:
```bash
docker exec -t acneguard-postgres pg_dump -U acneguard_user acneguard > acneguard_backup_$(date +%F).sql
```

### Restore Database:
```bash
cat acneguard_backup_2026-11-15.sql | docker exec -i acneguard-postgres psql -U acneguard_user -d acneguard
```

---

## 4. Security Hardening Checklist

- [x] **Non-Root Execution**: Backend runs under dedicated unprivileged user `acneguard`.
- [x] **File Upload Sanitization**: 10MB payload limit & MIME validation to prevent DoS.
- [x] **Security Headers**: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`.
- [x] **Multi-Stage Builds**: Docker images strip build tools, keeping runtime images lean and secure.
- [x] **Code Splitting**: Heavy client libraries (`jspdf`, `html2canvas`) isolated into separate asynchronous chunks.

---

## 5. SSL / TLS Setup (Let's Encrypt + Certbot)

For a public domain (e.g., `acneguard.yourdomain.com`):

1. Install Certbot on your host server:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```
2. Request a certificate:
   ```bash
   sudo certbot --nginx -d acneguard.yourdomain.com
   ```
3. Certbot will configure SSL renewal cron jobs automatically.
