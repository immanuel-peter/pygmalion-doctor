type DidResponse = {
  id: string;
  status: string;
  result_url?: string;
  stream_url?: string;
};

const DEFAULT_BASE_URL = "https://api.d-id.com";

export async function triggerDidTalk(message: string) {
  const apiKey = process.env.DID_API_KEY;
  const sourceUrl = process.env.DID_SOURCE_URL;
  if (!apiKey || !sourceUrl) {
    return null;
  }

  try {
    const baseUrl = process.env.DID_API_BASE_URL || DEFAULT_BASE_URL;
    const voiceId = process.env.DID_VOICE_ID;

    const payload: Record<string, unknown> = {
      script: {
        type: "text",
        input: message,
        provider: voiceId
          ? {
              type: "elevenlabs",
              voice_id: voiceId,
            }
          : undefined,
      },
      source_url: sourceUrl,
    };

    const response = await fetch(`${baseUrl}/talks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`D-ID request failed (${response.status}): ${detail}`);
    }

    const json = (await response.json()) as DidResponse;
    return {
      talkId: json.id,
      streamUrl: json.stream_url,
      resultUrl: json.result_url,
    };
  } catch (error) {
    console.error("triggerDidTalk failed", error);
    return null;
  }
}

