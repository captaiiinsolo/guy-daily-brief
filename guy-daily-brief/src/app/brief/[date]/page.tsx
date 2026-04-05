import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import SectionBlock from "@/components/SectionBlock";
import Watchlist from "@/components/Watchlist";
import { getAllBriefDates, getBriefByDate } from "@/lib/briefings";

export function generateStaticParams() {
  return getAllBriefDates().map((date) => ({ date }));
}

export default async function BriefPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const brief = getBriefByDate(date);

  if (!brief) return notFound();

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,_#09090b,_#111827)] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-4">
          <Link href="/archive" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300 transition hover:text-sky-200">
            ← Back to archive
          </Link>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Daily Brief</p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {format(new Date(`${brief.date}T12:00:00`), "EEEE, MMMM d, yyyy")}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-zinc-300">{brief.summary}</p>
        </header>

        <SectionBlock title="US News" stories={brief.sections.us} />
        <SectionBlock title="World News" stories={brief.sections.world} />
        <SectionBlock title="Tech / Hacker News" stories={brief.sections.tech} />
        <Watchlist items={brief.watchlist} />
      </div>
    </main>
  );
}
