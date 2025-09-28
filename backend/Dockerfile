# syntax=docker/dockerfile:1
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS base

# Enable bytecode and unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy project metadata and lock
COPY pyproject.toml ./

# Install dependencies (generate lock if missing)
RUN uv lock && uv sync --no-dev --no-editable

# Copy source
COPY app ./app

# Expose port and run
EXPOSE 8000
CMD ["uv", "run", "serve"]
