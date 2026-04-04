"use client";

import { useMemo, useState } from "react";
import type { BriefCategory } from "@/lib/sources";

type Props = {
  section: BriefCategory;
};

const sectionLabels: Record<BriefCategory, string> = {
  us: "US",
  world: "World",
  tech: "Tech",
};

export default function RefreshSectionButton({ section }: Props) {
  const [copied, setCopied] = useState(false);

  const dispatchUrl = useMemo(() => {
    const base = "https://github.com/captaiiinsolo/guy-daily-brief/actions/workflows/publish-daily-brief.yml";
    return `${base}`;
  }, []);

  async function copyInstructions() {
    const text = `Refresh ${sectionLabels[section]} section:\n1. Open ${dispatchUrl}\n2. Click Run workflow\n3. Keep branch on main\n4. Set section to ${section}\n5. Run it`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <a
        href={dispatchUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200 transition hover:border-sky-300/45 hover:bg-sky-400/15 hover:text-white"
        aria-label={`Open GitHub Actions to refresh the ${sectionLabels[section]} section`}
      >
        Refresh this section
      </a>
      <button
        type="button"
        onClick={copyInstructions}
        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        {copied ? "Copied" : "Copy instructions"}
      </button>
    </div>
  );
}
