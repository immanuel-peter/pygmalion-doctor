# Pygmalion Doctor

Prototype stack for a bedside triage experience powered by OpenAI Responses and (future) D-ID avatar delivery.

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) for backend dependency management
- Node 20+ with [pnpm](https://pnpm.io/) for the Next.js frontend
- Docker if you prefer `docker-compose` orchestration

## Quick Start

```bash
# spin up both services
docker compose up --build

# or run locally without containers
uv sync && uv run uvicorn app.main:app --reload --app-dir backend/app
cd frontend && pnpm install && pnpm dev
```

The frontend expects the backend on `http://localhost:8000` (adjust via `NEXT_PUBLIC_API_BASE_URL`). Set `OPENAI_API_KEY` and `OPENAI_BASE_URL=https://pygmalion.herdora.com/v1` before launching the API.

See `backend/README.md` and `frontend/README.md` for service-specific notes.

