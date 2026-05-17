import { endStorefrontSession } from "@/app/actions";
import { RainMark } from "@/components/rain-mark";

type Props = {
  containerClass: string;
};

export function SiteHeader({ containerClass }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/85 backdrop-blur">
      <div className={`flex h-12 items-center justify-between ${containerClass}`}>
        <div className="flex items-baseline gap-2">
          <RainMark size="sm" />
          <span className="text-[12px] text-zinc-400" aria-hidden>
            ·
          </span>
          <span className="text-[12px] font-medium text-zinc-500">
            New hire laptop
          </span>
        </div>
        <form action={endStorefrontSession}>
          <button
            type="submit"
            className="text-[12px] font-medium text-zinc-500 transition hover:text-[color:var(--rain-pink)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
