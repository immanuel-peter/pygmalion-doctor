'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CaptureResult = {
  dataUrl: string;
  analysis: string;
  responseId?: string;
};

const TRIAGE_ENDPOINT = "/api/triage";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [symptomNote, setSymptomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamReady(true);
        }
      } catch (err: any) {
        console.error("camera init failed", err);
        setPermissionError(err?.message || "Unable to access camera");
      }
    };

    enableCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const canCapture = useMemo(() => streamReady && !isSubmitting && !permissionError, [streamReady, isSubmitting, permissionError]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      throw new Error("Camera is not ready");
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error("Camera feed unavailable");
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to access canvas context");
    }

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  const submitCapture = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const dataUrl = captureFrame();
      const base64Match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      if (!base64Match) {
        throw new Error("Failed to encode capture");
      }
      const imageBase64 = base64Match[2];

      const res = await fetch(TRIAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: symptomNote || "", image_base64: imageBase64 }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail || `Request failed with status ${res.status}`);
      }

      const json = await res.json();
      setResult({ dataUrl, analysis: json.analysis || "", responseId: json.response_id });
    } catch (err: any) {
      console.error("capture submission failed", err);
      setSubmitError(err?.message || "Unable to submit capture");
    } finally {
      setIsSubmitting(false);
    }
  }, [captureFrame, symptomNote]);

  return (
    <div className="space-y-4 text-slate-100">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Patient camera</h3>
        <p className="text-xs text-slate-400">Keep the lens steady, then tap capture when guidance would benefit from a visual.</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        {permissionError ? (
          <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-red-400">
            {permissionError}
          </div>
        ) : (
          <video ref={videoRef} playsInline className="h-64 w-full object-cover" />
        )}

        <button
          type="button"
          onClick={submitCapture}
          disabled={!canCapture}
          className="absolute bottom-4 right-4 inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isSubmitting ? "Analyzing" : "Capture"}
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <textarea
        value={symptomNote}
        onChange={(event) => setSymptomNote(event.target.value)}
        placeholder="Optional note for the doctor"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
      />

      {submitError && <p className="text-xs text-red-400">{submitError}</p>}

      {!result ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Awaiting capture</p>
          <p className="mt-2 text-sm text-slate-300">Your photo stays local until you send it for review alongside the conversation history.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Latest capture</p>
          <div className="overflow-hidden rounded-xl border border-emerald-300/40 bg-emerald-500/10">
            <img src={result.dataUrl} alt="Captured condition" className="max-h-48 w-full object-cover" />
          </div>
          <p>{result.analysis || "No analysis returned."}</p>
          {result.responseId && <p className="text-xs text-emerald-200">Response id: {result.responseId}</p>}
        </div>
      )}
    </div>
  );
}

