# Edu Learn Pro – E-Learning Platform

Edu Learn Pro is a full-stack e-learning platform that supports instructor-led content, student progress tracking, and analytics for both roles. The project follows a 16-day roadmap covering architecture setup through documentation and testing.

## Tech Stack
- **Frontend:** React (Vite, TypeScript), Tailwind CSS, React Query, React Router
- **Backend:** FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic
- **Auth & Security:** JWT (python-jose), bcrypt password hashing
- **Tooling:** pnpm, ESLint, Prettier, Alembic migrations

## Core Features
- User registration, login, logout with role-based access (student, instructor, admin)
- Profile management and role-specific dashboards
- Course CRUD for instructors with thumbnail uploads
- Lesson management with ordering, text, and optional video links
- Catalog browsing, search, filtering, and course enrollment
- Learning interface with progress tracking and lesson completion
- Progress analytics, instructor course metrics, student streak overview
- Certificate generation for completed enrollments

## Project Structure
```
backend/        FastAPI application, models, schemas, routes, Alembic
frontend/       React SPA with routes, components, hooks, Tailwind styling
docs/           Project plan, API reference, DB schema, user guide, testing notes
```

## Getting Started
### Prerequisites
- Node.js 20+ and pnpm (or npm)
- Python 3.11+
- PostgreSQL 15+ running locally (ensure a database and user are provisioned)

### Setup
1. **Clone & install dependencies**
   ```bash
   pnpm install --prefix frontend
   python -m venv .venv && .\.venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
2. **Configure environment**
   - Copy `backend/env.example` → `backend/.env` and adjust secrets (set `DATABASE_URL` for your PostgreSQL instance).
   - Copy `frontend/env.example` → `frontend/.env`.
3. **Provision PostgreSQL**
   - Create a database (default examples use `edulearn_pro`).
   - Create a user (default `edulearn` / `edulearn`) and grant privileges to the database.
4. **Apply migrations & seed sample data**
   ```bash
   cd backend
   alembic upgrade head
   python -m app.db.init_db
   ```

## Running Locally
- **Backend API**
  ```bash
  uvicorn app.main:app --reload
  ```
  API available at `http://localhost:8000/api/v1`.

- **Frontend SPA**
  ```bash
  pnpm --dir frontend dev
  ```
  App available at `http://localhost:5173`.

## Testing & Quality
- Frontend linting: `pnpm --dir frontend lint`
- Backend type checks & formatting rely on FastAPI + SQLAlchemy conventions; add `pytest` as needed.
- Manual QA checklist and role-based test cases are documented in `docs/testing.md`.

## Documentation
Detailed references live in the `docs/` directory:
- `project-plan.md` – 16-day roadmap (adjusted for FastAPI + React stack)
- `api.md` – endpoint reference and request/response contracts
- `db-schema.md` – ERD summary and table relationships
- `user-guide.md` – role-based walkthroughs and feature highlights
- `testing.md` – test strategy, scenarios, and known gaps

## Deployment Notes
- Configure production-ready secrets (`SECRET_KEY`, database credentials).
- Use a WSGI/ASGI server (e.g., Uvicorn + Gunicorn) behind a reverse proxy.
- Serve the React build output (via `pnpm --dir frontend build`) from a CDN or static host, and ensure CORS settings permit the production origin.

## License
This project is provided as a learning reference. Adapt licensing as required before public distribution.

