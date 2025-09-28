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

  const canCapture = useMemo(() => streamReady && !isSubmitting, [streamReady, isSubmitting]);

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
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
          {permissionError ? (
            <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-red-500">
              {permissionError}
            </div>
          ) : (
            <video ref={videoRef} playsInline className="h-48 w-full bg-black object-cover" />
          )}
        </div>
        <textarea
          value={symptomNote}
          onChange={(event) => setSymptomNote(event.target.value)}
          placeholder="Describe what the patient is experiencing..."
          className="h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <button
          type="button"
          onClick={submitCapture}
          disabled={!canCapture}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Analyzing..." : "Capture & Analyze"}
        </button>
        {submitError && <p className="text-xs text-red-500">{submitError}</p>}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        {!result ? (
          <div className="flex h-full flex-col justify-center gap-3">
            <span className="font-mono text-xs uppercase text-slate-500">Awaiting capture</span>
            <p>Provide a quick description and hit capture. The OpenAI Responses API will combine your note with the photo to prioritize next steps.</p>
            <p className="text-xs text-slate-500">Need help? Ensure your browser has camera permissions enabled and that you&apos;re serving over HTTPS.</p>
          </div>
        ) : (
          <div className="flex h-full flex-col gap-3">
            <span className="font-mono text-xs uppercase text-emerald-600">Analysis ready</span>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={result.dataUrl} alt="Captured condition" className="max-h-48 w-full object-cover" />
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
              {result.analysis || "No analysis returned."}
            </div>
            {result.responseId && (
              <span className="text-xs text-slate-400">OpenAI response id: {result.responseId}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

