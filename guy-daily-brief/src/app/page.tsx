import Link from "next/link";
import { format } from "date-fns";
import SectionBlock from "@/components/SectionBlock";
import Watchlist from "@/components/Watchlist";
import { getLatestBrief } from "@/lib/briefings";

export default function HomePage() {
  const brief = getLatestBrief();

  if (!brief) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Guy Daily Brief</p>
          <h1 className="text-3xl font-semibold tracking-tight">No briefing found yet</h1>
          <p className="text-sm leading-6 text-zinc-400">
            Add a file to <code className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300">content/briefs</code> to get started.
          </p>
        </div>
      </main>
    );
  }

  const formattedDate = format(new Date(`${brief.date}T12:00:00`), "EEEE, MMMM d");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_35%),linear-gradient(to_bottom,_#09090b,_#0f172a_140%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300">news.solomonsantos.me</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Guy Daily Brief</h1>
            </div>
            <Link
              href="/archive"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-sky-300/30 hover:text-white"
            >
              Archive
            </Link>
          </div>

          <div className="space-y-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
            <p className="text-sm text-zinc-400">{formattedDate}</p>
            <p className="max-w-xl text-sm leading-6 text-zinc-300">{brief.summary}</p>
          </div>
        </header>

        <SectionBlock title="US News" stories={brief.sections.us} />
        <SectionBlock title="World News" stories={brief.sections.world} />
        <SectionBlock title="Tech / Hacker News" stories={brief.sections.tech} />
        <Watchlist items={brief.watchlist} />
      </div>
    </main>
  );
}
