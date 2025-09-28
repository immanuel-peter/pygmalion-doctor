import Image from "next/image";
import DIDPlaceholder from "@/components/DIDPlaceholder";
import CameraCapture from "@/components/CameraCapture";
import VoiceChat from "@/components/VoiceChat";

async function fetchHealth() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export default async function Home() {
  let health: any = { status: "unknown" };
  try {
    health = await fetchHealth();
  } catch (err) {
    health = { status: "unavailable" };
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="Pygmalion Doctor" width={120} height={26} priority />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 sm:inline">
              AI Doctor
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {health.status}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            <div className="aspect-[4/3] w-full bg-slate-900">
              <DIDPlaceholder />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur">
                <VoiceChat />
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <CameraCapture />
          </aside>
        </section>
      </main>
    </div>
  );
}
