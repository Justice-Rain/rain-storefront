import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SelectionForm } from "@/components/selection-form";
import { StandardsReference } from "@/components/standards-reference";

const shell = "mx-auto w-full max-w-3xl px-5";

export default function Home() {
  return (
    <>
      <SiteHeader containerClass={shell} />
      <main className={`${shell} flex flex-1 flex-col gap-7 pb-16 pt-6`}>
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div
            className="rain-glow absolute -right-12 -top-12 h-56 w-56"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-4 p-5 sm:p-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rain-pink)]">
                Welcome
              </p>
              <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[26px]">
                Pick a different laptop
              </h1>
              <p className="mt-1.5 text-[13.5px] leading-snug text-zinc-500">
                We sent you the specs of your standard laptop by email. If it
                isn&rsquo;t the right fit, choose another option below and
                we&rsquo;ll ship it instead.
              </p>
            </div>
            <div className="relative hidden h-24 w-24 shrink-0 sm:block">
              <Image
                src="/brand/rain-card.png"
                alt=""
                fill
                priority
                sizes="96px"
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        <StandardsReference />

        <SelectionForm />
      </main>
    </>
  );
}
