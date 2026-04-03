import type { Story } from "@/lib/schema";

type Props = {
  title: string;
  stories: Story[];
};

export default function SectionBlock({ title, stories }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {stories.length} item{stories.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4">
        {stories.map((story, i) => (
          <article
            key={`${story.headline}-${i}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm transition hover:border-sky-400/20 hover:bg-white/[0.07]"
          >
            <h3 className="text-base font-semibold leading-tight text-white sm:text-lg">{story.headline}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{story.summary}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              <span className="font-medium text-zinc-200">Why it matters:</span>{" "}
              {story.whyItMatters}
            </p>
            <a
              href={story.source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-300 transition hover:text-sky-200"
            >
              {story.source.name}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
