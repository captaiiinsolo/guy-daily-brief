import type { Story } from "@/lib/schema";

type Props = {
  title: string;
  stories: Story[];
};

export default function SectionBlock({ title, stories }: Props) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Section</p>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">{title}</h2>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {stories.length} item{stories.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4">
        {stories.map((story, i) => (
          <article
            key={`${story.headline}-${i}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm transition hover:border-sky-400/20 hover:bg-white/[0.07] sm:p-6"
          >
            <h3 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-white sm:text-xl">{story.headline}</h3>
            <p className="mt-3 text-base leading-7 text-zinc-200">{story.summary}</p>
            <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-[15px]">
              <span className="mr-1 font-semibold uppercase tracking-[0.16em] text-zinc-500">Why it matters</span>
              {story.whyItMatters}
            </p>

            {(story.author || story.publishedAt || story.source.url) && (
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <span>{story.source.name}</span>
                {story.author ? <span>{story.author}</span> : null}
                {story.publishedAt ? <span>{story.publishedAt}</span> : null}
              </div>
            )}

            {story.extractedText ? (
              <div className="mt-5 space-y-4 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Full extracted text</p>
                {story.extractedText
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, idx) => (
                    <p key={idx} className="text-[15px] leading-7 text-zinc-300 sm:text-base">
                      {paragraph.replace(/\s+/g, " ").trim()}
                    </p>
                  ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
