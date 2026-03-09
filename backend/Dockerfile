# Backend + DB stack: run from repo root with docker-compose up
FROM python:3.9-slim

WORKDIR /app

# Install dependencies (from pyproject.toml)
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    sqlalchemy==2.0.23 \
    psycopg2-binary==2.9.9 \
    pydantic==2.5.0 \
    python-dotenv==1.0.0 \
    python-multipart==0.0.6 \
    email-validator==2.1.0 \
    passlib==1.7.4 \
    python-jose==3.3.0 \
    'twilio>=8.0.0'

COPY . .

# Don't bake .env into image; use env_file / env in compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
