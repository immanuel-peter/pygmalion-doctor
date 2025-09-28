import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  if (typeof message !== "string") {
    return NextResponse.json({ detail: "message is required" }, { status: 400 });
  }
  return NextResponse.json({ echo: message });
}

