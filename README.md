# Quality Mobile Detailing Website

Full-stack site built from the **building.md** guide: FastAPI backend, PostgreSQL, and React frontend.

## Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **Frontend**: React 18, React Router, Axios, Vite

## Quick start (local, no Docker)

### 1. Install and set up PostgreSQL

**Install PostgreSQL** (if not already installed):

- **Ubuntu / Debian:**  
  `sudo apt update && sudo apt install postgresql postgresql-contrib`
- **Fedora:**  
  `sudo dnf install postgresql-server postgresql-contrib && sudo postgresql-setup --initdb`
- **Arch:**  
  `sudo pacman -S postgresql`
- **macOS (Homebrew):**  
  `brew install postgresql@15`

**Start the server:**

- **Linux (systemd):**  
  `sudo systemctl start postgresql`  
  (optional: `sudo systemctl enable postgresql` to start on boot)
- **macOS:**  
  `brew services start postgresql@15`

**Create the database and user:**

Option A — use the default `postgres` user (simplest):

```bash
# Switch to the postgres system user and open the PostgreSQL shell
sudo -u postgres psql

# Inside psql, create the database:
CREATE DATABASE quality_detailing_db;

# Set a password for the postgres user (so you can use it in .env):
ALTER USER postgres PASSWORD 'postgres';

# Exit
\q
```

Then in `backend/.env` use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quality_detailing_db
```

Option B — create a dedicated user and database:

```bash
sudo -u postgres psql

CREATE USER quality_app WITH PASSWORD 'your_password_here';
CREATE DATABASE quality_detailing_db OWNER quality_app;
\q
```

Then in `backend/.env`:

```env
DATABASE_URL=postgresql://quality_app:your_password_here@localhost:5432/quality_detailing_db
```

**Tables:** The FastAPI app creates all tables automatically on first run (via SQLAlchemy). You do **not** need to run `init_db.sql` unless you prefer to create the schema by hand.

### 2. Backend (using uv)

Install [uv](https://docs.astral.sh/uv/) if needed (`curl -LsSf https://astral.sh/uv/install.sh | sh` or `pip install uv`).

```bash
cd backend
uv venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
uv sync
```

Copy env and set your DB URL:

```bash
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql://user:password@localhost:5432/quality_detailing_db
```

Run the API:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or with the venv activated: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

API: http://localhost:8000  
Docs: http://localhost:8000/docs  

Seed sample services (optional):

```bash
uv run python -m app.seed
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000  

Frontend calls the API at `http://localhost:8000` by default. To use another URL, set `VITE_API_URL` in a `.env` in the frontend (e.g. `VITE_API_URL=http://localhost:8000`).

## Docker

From the project root:

```bash
docker-compose up -d
```

- API: http://localhost:8000  
- Frontend: http://localhost:3000 (nginx serving the built app)  
- Postgres: localhost:5432 (user `postgres`, password `postgres`, db `quality_detailing_db`)

For the frontend container to talk to the backend, you may need to set `VITE_API_URL=http://localhost:8000` (or the backend’s Docker hostname) at build time or configure nginx to proxy `/api` to the backend.

## Features

- **Services**: List services, get by slug, list packages per service
- **Bookings**: Create customer + booking (name, email, package, date)
- **Reviews**: List and verified reviews
- **Contact**: Submit contact form
- **Blog**: List published posts, view by slug
- **Business**: Business info and FAQs

## Project layout

```
mitu/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   ├── crud/
│   │   └── routers/
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── scripts/
│   └── init_db.sql
├── docker-compose.yml
└── building.md
```

## Checklist (from building.md)

- [x] PostgreSQL database and tables (via SQLAlchemy or init_db.sql)
- [x] FastAPI on port 8000
- [x] React app (Vite) on port 3000
- [x] Nav, Hero, Services, Reviews, Blog, FAQ, Contact, Footer
- [x] Service detail page and booking flow
- [x] Contact form → API
- [x] Reviews from API
- [x] Blog and FAQs from API
- [x] CORS and API docs at /docs
