# Pygmalion Doctor

Single Next.js application delivering a bedside triage experience powered by OpenAI Responses and D-ID avatar delivery.

docker compose up --build
## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/)

## Quick Start

```bash
pnpm install
pnpm dev
```

## Environment Variables

Create `.env.local` with the following keys as needed:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (optional, defaults to `https://pygmalion.herdora.com/v1`)
- `OPENAI_RESPONSES_MODEL` (defaults to `gpt-5-mini`)
- `OPENAI_TRANSCRIPTION_MODEL` (defaults to `gpt-4o-mini-transcribe`)
- `OPENAI_VOICE` (defaults to `alloy`)
- `DID_API_KEY`
- `DID_SOURCE_URL`
- `DID_VOICE_ID` (optional)

Deploy on Vercel by connecting this repository and setting the same environment variables in the project settings.

