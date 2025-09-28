"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type VoiceTurn = {
  id: string;
  assistantMessage: string;
  userTranscript?: string;
  audioUrl?: string;
  did?: {
    talkId: string;
    streamUrl?: string;
    resultUrl?: string;
  } | null;
};

type VoiceResponse = {
  transcript?: string;
  message: string;
  responseId?: string;
  audioBase64?: string;
  audioContentType?: string;
  did?: {
    talkId: string;
    streamUrl?: string;
    resultUrl?: string;
  } | null;
};

const VOICE_ENDPOINT = "/api/voice/respond";

export default function VoiceChat() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const enableMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          chunksRef.current = [];
          await handleSubmission(blob);
        };

        mediaRecorderRef.current = recorder;
        setPermissionError(null);
      } catch (error: any) {
        console.error("mic access failed", error);
        setPermissionError(error?.message || "Microphone access denied");
      }
    };

    enableMicrophone();

    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      setSubmitError("Microphone is not ready");
      return;
    }

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setSubmitError(null);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const canRecord = useMemo(() => !isRecording && !isSubmitting && !permissionError, [isRecording, isSubmitting, permissionError]);

  const handleSubmission = useCallback(
    async (blob: Blob) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const base64 = await blobToBase64(blob);

        const response = await fetch(VOICE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio_base64: base64,
            audio_content_type: blob.type || "audio/webm",
          }),
        });

        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.detail || `Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as VoiceResponse;

        const audioUrl = json.audioBase64
          ? createAudioUrl(json.audioBase64, json.audioContentType || "audio/mpeg")
          : undefined;

        setTurns((prev) => [
          {
            id: crypto.randomUUID(),
            userTranscript: json.transcript,
            assistantMessage: json.message,
            audioUrl,
            did: json.did ?? null,
          },
          ...prev,
        ]);

        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch((err) => console.error("audio playback failed", err));
        }
      } catch (error: any) {
        console.error("voice submission failed", error);
        setSubmitError(error?.message || "Unable to process voice input");
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const latestTurn = turns[0] ?? null;

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isRecording && !canRecord}
          className={`inline-flex min-w-[200px] flex-1 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
          }`}
        >
          <span className={`flex h-2.5 w-2.5 items-center justify-center ${isRecording ? "animate-pulse" : ""}`}>
            <span className={`h-2 w-2 rounded-full bg-white ${isRecording ? "" : "opacity-80"}`} />
          </span>
          {isRecording ? "Stop" : "Start"} talking
        </button>
        {isSubmitting && (
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-300">
            Processing…
          </span>
        )}
      </div>

      {permissionError && <p className="text-xs text-red-400">{permissionError}</p>}
      {submitError && <p className="text-xs text-red-400">{submitError}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-200">
        {!latestTurn ? (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Avatar ready</span>
            <p>Speak naturally when you&apos;re ready. The AI doctor listens in real time and mirrors the reply through D-ID.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestTurn.userTranscript && (
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">You:</span> {latestTurn.userTranscript}
              </p>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-400">AI Doctor</p>
              <p>{latestTurn.assistantMessage}</p>
            </div>
            {latestTurn.audioUrl && (
              <audio
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/40"
                controls
                src={latestTurn.audioUrl}
              />
            )}
            {latestTurn.did?.resultUrl && (
              <a
                href={latestTurn.did.resultUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold text-emerald-300 hover:text-emerald-200"
              >
                View D-ID render
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read recording"));
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const match = result.match(/^data:(?:.*);base64,(.+)$/);
        resolve(match ? match[1] : result);
      } else {
        reject(new Error("Unexpected reader result"));
      }
    };
    reader.readAsDataURL(blob);
  });
}

function createAudioUrl(base64: string, contentType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });
  return URL.createObjectURL(blob);
}

