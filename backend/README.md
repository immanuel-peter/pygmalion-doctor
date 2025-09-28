# Backend (FastAPI)

API service providing health checks, echo testing, and OpenAI-powered triage.

## Setup

```bash
uv sync
uv run uvicorn app.main:app --reload
```

The app listens on http://localhost:8000 by default.

## Environment

| Variable | Description | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Required key for the OpenAI Responses API | _none_ |
| `OPENAI_BASE_URL` | Override the OpenAI host | `https://pygmalion.herdora.com/v1` |
| `OPENAI_RESPONSES_MODEL` | Model used for triage calls | `gpt-5-mini` |

## Endpoints
- `GET /health` – readiness probe
- `POST /echo` – echoes `message`
- `POST /triage` – accepts `{ prompt, image_base64 }` and returns analysis text

