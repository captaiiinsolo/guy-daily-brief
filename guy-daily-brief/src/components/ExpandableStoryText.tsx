"use client";

import { useState } from "react";

type Props = {
  text: string;
};

export default function ExpandableStoryText({ text }: Props) {
  const [open, setOpen] = useState(false);

  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim());

  return (
    <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400"
        aria-expanded={open}
      >
        <span>{open ? "Hide extracted text" : "Show extracted text"}</span>
        <span className={`text-zinc-500 transition ${open ? "rotate-180 text-zinc-300" : ""}`}>⌄</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-4 border-t border-white/8 pt-4">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-[15px] leading-7 text-zinc-300 sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
