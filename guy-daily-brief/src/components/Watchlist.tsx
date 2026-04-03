type Props = {
  items: string[];
};

export default function Watchlist({ items }: Props) {
  return (
    <section className="space-y-4">
      <div className="border-b border-white/10 pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Watchlist</h2>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <ul className="space-y-3 text-sm leading-6 text-zinc-300">
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
