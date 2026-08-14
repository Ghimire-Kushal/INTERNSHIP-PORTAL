# Job & Internship Portal

A full-stack recruitment portal for students, employers, and administrators. The project uses Django REST Framework for its API and React + Vite for its web client.

## Phase 1 status

This repository contains the runnable project foundation:

- Django REST Framework API with CORS, JWT-ready authentication settings, PostgreSQL configuration, media/static settings, and a public health endpoint.
- React + Vite client with React Router, Axios, Tailwind CSS, and a connection test page.
- Environment examples for local development.

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

For an immediate no-PostgreSQL smoke test, set `USE_SQLITE=True` in `backend/.env` before running migrations. For the intended setup, create `job_portal_db` in PostgreSQL and fill in `DB_*` values.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000. The home page calls `GET /api/health/` and displays **Backend Connected Successfully** when Django is running.

## Phase 1 API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health/` | Public API/service health check |
| GET | `/api/schema/` | OpenAPI schema |
| GET | `/api/docs/` | Swagger UI |

## Planned architecture

```text
backend/       Django project and domain apps
frontend/      React/Vite application
```

## Authentication endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register/` | Public — student/employer only |
| POST | `/api/auth/login/` | Public |
| POST | `/api/auth/token/refresh/` | Public with refresh token |
| GET/PUT/PATCH | `/api/auth/profile/` | Authenticated user |
| POST | `/api/auth/change-password/` | Authenticated user |

Admin accounts must be created using `python manage.py createsuperuser`; public registration deliberately cannot create them.
