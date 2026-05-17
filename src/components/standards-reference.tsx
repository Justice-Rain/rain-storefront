import type { LaptopConfig } from "@/lib/catalog";
import { standardLaptops } from "@/lib/catalog";

export function StandardsReference() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Standard Mac options
        </h2>
        <span className="text-[11px] text-zinc-400">Encouraged</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {standardLaptops.map((l) => (
          <StandardCard key={l.id} laptop={l} />
        ))}
      </div>
    </section>
  );
}

function StandardCard({ laptop }: { laptop: LaptopConfig }) {
  return (
    <article className="rounded-lg border border-dashed border-zinc-300 bg-white/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--rain-pink)]">
        Standard · {laptop.teamStandard}
      </p>
      <h3 className="mt-1.5 text-[14.5px] font-semibold leading-tight text-zinc-900">
        {laptop.brand}
      </h3>
      <p className="mt-0.5 text-[12px] text-zinc-600">{laptop.modelLine}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
        <Spec label="Display" value={laptop.display} />
        <Spec label="Chip" value={laptop.chip} />
        <Spec label="Memory" value={laptop.memory} />
        <Spec label="Storage" value={laptop.storage} />
      </dl>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9.5px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-medium leading-tight text-zinc-900">
        {value}
      </dd>
    </div>
  );
}
