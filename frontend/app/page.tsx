import Link from "next/link";
import Image from "next/image";
import DIDPlaceholder from "../components/DIDPlaceholder";
import CameraCapture from "../components/CameraCapture";

async function fetchBackend(path: string, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 0 }, ...init });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export default async function Home() {
  let health: any = { status: "unknown" };
  try {
    health = await fetchBackend("/health");
  } catch (err) {
    health = { status: "unavailable" };
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={140}
              height={30}
              priority
            />
            <span className="hidden text-xs uppercase tracking-wider text-slate-500 sm:inline">
              Pygmalion Doctor Prototype
            </span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-slate-500">
            <Link className="hover:text-slate-800" href="#camera">Camera</Link>
            <Link className="hover:text-slate-800" href="#did">D-ID Agent</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">System Overview</h1>
          <p className="mt-2 text-sm text-slate-600">
            This prototype validates the full pipeline: capturing patient context, streaming insights from OpenAI, and
            preparing an interactive D-ID avatar for bedside delivery.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold uppercase tracking-wide">Backend</span>
            <span className="font-mono text-slate-700">{health.status}</span>
          </div>
        </section>

        <section id="camera" className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Capture a Medical Photo</h2>
          <p className="mt-2 text-sm text-slate-600">
            Snap a photo of the condition. We&apos;ll send it to the backend where the OpenAI Responses API can interpret the
            visual details alongside your conversation and prepare guidance for the D-ID agent.
          </p>
          <div className="mt-6">
            <CameraCapture />
          </div>
        </section>

        <section id="did" className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">D-ID Conversational Agent</h2>
              <p className="mt-2 text-sm text-slate-600">
                A hyper-real avatar will deliver the AI&apos;s bedside guidance. While we plug in the real-time D-ID stream, this
                placeholder keeps the layout stable for future UI work.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                The final experience will blend speech synthesis, lip-sync, and OpenAI Responses for empathetic bedside
                coaching.
              </p>
            </div>
            <div className="flex-1 min-w-[220px]">
              <DIDPlaceholder />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Next Steps</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Enable a client-side camera component using a React 19 compatible library.</li>
            <li>Stream captured images to the backend image triage endpoint.</li>
            <li>Pipe text + image context into the OpenAI Responses API and broadcast to the D-ID agent.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
