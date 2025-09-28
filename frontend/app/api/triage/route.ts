import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const backendResponse = await fetch(`${INTERNAL_API_BASE_URL}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();

    return new Response(body, {
      status: backendResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error: any) {
    console.error("/api/triage proxy error", error);
    const message = error?.message || "Failed to reach triage backend";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}

