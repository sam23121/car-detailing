FROM python:3.9-slim

WORKDIR /app

# Install uv and sync dependencies from pyproject.toml
COPY pyproject.toml .
RUN pip install uv && uv sync --no-dev --no-install-project

COPY . .

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
