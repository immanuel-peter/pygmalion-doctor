import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, getResponsesModel } from "@/lib/openaiClient";

export const runtime = "nodejs";
export const preferredRegion = process.env.VERCEL_REGION || undefined;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { prompt, image_base64: imageBase64 } = payload ?? {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ detail: "image_base64 is required" }, { status: 400 });
    }

    try {
      Buffer.from(imageBase64, "base64");
    } catch (error) {
      return NextResponse.json({ detail: "Invalid base64 image data" }, { status: 400 });
    }

    const client = getOpenAIClient();

    const safePrompt = typeof prompt === "string" && prompt.trim().length > 0
      ? prompt.trim()
      : "You are a medical triage assistant. Analyze the photo and provide next steps.";

    const response = await client.responses.create({
      model: getResponsesModel(),
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: safePrompt },
            {
              type: "input_image",
              image_base64: imageBase64,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      analysis: response.output_text ?? "No analysis available.",
      response_id: response.id,
    });
  } catch (error: any) {
    console.error("/api/triage error", error);
    const message = error?.message || "Internal server error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

