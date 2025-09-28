import VoiceChat from "@/components/VoiceChat";

export default function VoicePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-14">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Prototype</p>
        <h1 className="text-2xl font-semibold text-slate-900">Voice Triage Playground</h1>
        <p className="text-sm text-slate-600">
          Record a bedside update. We transcribe via OpenAI, craft a clinical summary, synthesize speech, and trigger
          the D-ID avatar to deliver the guidance.
        </p>
      </header>
      <VoiceChat />
    </main>
  );
}

