# Backend only. Run from repo root: docker compose up -d
# Uses uv for install. DB and env come from backend/.env (e.g. Neon or local Postgres).

FROM python:3.9-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install deps with uv (no dev)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# App code
COPY . .

# Don't bake .env into image; use env_file in compose or host env
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
