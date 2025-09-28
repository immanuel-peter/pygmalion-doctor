import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not configured");
  }

  cachedClient = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  return cachedClient;
}

export function getResponsesModel() {
  return process.env.OPENAI_RESPONSES_MODEL || "gpt-5-mini";
}

export function getTranscriptionModel() {
  return process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
}

