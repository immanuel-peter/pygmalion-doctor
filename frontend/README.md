# Frontend (Next.js)

React 19 / Next 15 App Router client for the Pygmalion Doctor prototype.

## Setup

```bash
pnpm install
pnpm dev
```

The dev server runs at http://localhost:3000. It expects the FastAPI backend on `http://localhost:8000` unless `NEXT_PUBLIC_API_BASE_URL` is set.

## Features
- System overview dashboard
- Camera capture flow posting to `/api/triage`
- Placeholder panel reserving space for the upcoming D-ID avatar

## Environment

Create `.env.local` to override defaults. Useful keys:

- `NEXT_PUBLIC_API_BASE_URL` – external URL for browser calls (defaults to `http://localhost:8000`)
- `INTERNAL_API_BASE_URL` – server-side proxy target (set to `http://127.0.0.1:8000` in local dev)

