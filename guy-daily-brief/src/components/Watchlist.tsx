type Props = {
  items: string[];
};

export default function Watchlist({ items }: Props) {
  return (
    <section className="space-y-5">
      <div className="space-y-1 border-b border-white/10 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Section</p>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">Watchlist</h2>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-6">
        <ul className="space-y-4 text-base leading-7 text-zinc-200">
          {items.map((item, index) => (
            <li key={index} className="ml-5 list-disc marker:text-sky-300">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
