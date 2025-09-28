import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, getResponsesModel, getTranscriptionModel } from "@/lib/openaiClient";
import { triggerDidTalk } from "@/lib/didClient";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { audio_base64: audioBase64, audio_content_type: audioContentType } = payload ?? {};

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json({ detail: "audio_base64 is required" }, { status: 400 });
    }

    const client = getOpenAIClient();

    const audioBuffer = Buffer.from(audioBase64, "base64");

    const transcription = await client.audio.transcriptions.create({
      file: await toFile(audioBuffer, `patient-input.${getExtension(audioContentType)}`),
      model: getTranscriptionModel(),
    });

    const transcript = transcription.text || "";

    const response = await client.responses.create({
      model: getResponsesModel(),
      modalities: ["text", "audio"],
      audio: {
        voice: process.env.OPENAI_VOICE || "alloy",
        format: "mp3",
      },
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: transcript || "Provide a general triage greeting." },
          ],
        },
      ],
    });

    const message = response.output_text ?? "No insights available.";
    const audioResult = response.output?.find((item: any) => item.type === "output_audio");

    const did = await triggerDidTalk(message);

    return NextResponse.json({
      transcript,
      message,
      responseId: response.id,
      audioBase64: audioResult?.audio?.data,
      audioContentType: audioResult?.audio?.mime_type,
      did,
    });
  } catch (error: any) {
    console.error("/api/voice/respond error", error);
    const message = error?.message || "Internal server error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

async function toFile(buffer: Buffer, filename: string) {
  const { File } = await import("node:buffer");
  return new File([buffer], filename);
}

function getExtension(contentType?: string) {
  if (!contentType) {
    return "webm";
  }
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("mpeg")) return "mp3";
  if (contentType.includes("ogg")) return "ogg";
  return "webm";
}

