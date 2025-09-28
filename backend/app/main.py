from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
import base64
import os


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "test-key"),
    base_url=os.environ.get("OPENAI_BASE_URL", "https://pygmalion.herdora.com/v1"),
)

app = FastAPI(title="Pygmalion Doctor Backend")

# Allow frontend dev server and docker networks by default
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production via env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EchoRequest(BaseModel):
    message: str


class TriageRequest(BaseModel):
    prompt: str = Field(default="", description="Text context describing the patient's concern")
    image_base64: str = Field(description="Base64 encoded image data (without data URI prefix)")


class TriageResponse(BaseModel):
    analysis: str
    response_id: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/echo")
def echo(payload: EchoRequest):
    return {"echo": payload.message}


@app.post("/triage", response_model=TriageResponse)
def triage(payload: TriageRequest):
    try:
        # Validate base64 data
        try:
            base64.b64decode(payload.image_base64)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Invalid base64 image data") from exc

        prompt = payload.prompt.strip() or "You are a medical triage assistant. Analyze the photo and provide next steps."

        response = client.responses.create(
            model=os.environ.get("OPENAI_RESPONSES_MODEL", "gpt-5-mini"),
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "input_image",
                            "image_base64": payload.image_base64,
                        },
                    ],
                }
            ],
        )

        message = response.output_text or "No analysis available."
        return TriageResponse(analysis=message, response_id=response.id)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
