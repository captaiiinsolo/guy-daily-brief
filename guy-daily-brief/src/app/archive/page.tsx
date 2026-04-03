import Link from "next/link";
import { format } from "date-fns";
import { getAllBriefDates, getBriefByDate } from "@/lib/briefings";

export default function ArchivePage() {
  const dates = getAllBriefDates();

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,_#09090b,_#111827)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-4">
          <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300 transition hover:text-sky-200">
            ← Back to today
          </Link>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Library</p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Archive</h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-zinc-300">
            A clean running history of daily briefings — no feed casino, just the signal.
          </p>
        </header>

        <div className="space-y-3">
          {dates.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-base leading-7 text-zinc-300">
              No archived briefings yet.
            </div>
          ) : (
            dates.map((date) => {
              const brief = getBriefByDate(date);
              if (!brief) return null;

              return (
                <Link
                  key={date}
                  href={`/brief/${date}`}
                  className="block rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-sky-300/25 hover:bg-white/[0.07]"
                >
                  <div className="text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
                    {format(new Date(`${date}T12:00:00`), "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="mt-2 text-base leading-7 text-zinc-300">{brief.summary}</div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
