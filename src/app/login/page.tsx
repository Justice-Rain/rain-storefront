import Image from "next/image";
import { Suspense } from "react";

import { RainMark } from "@/components/rain-mark";
import { StorefrontLoginForm } from "@/components/storefront-login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-full flex-1 grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Hero artwork — hidden on small screens to keep things lean */}
      <div className="relative hidden overflow-hidden bg-[#e8e9ee] lg:block">
        <div className="rain-glow absolute inset-0" aria-hidden />
        <Image
          src="/brand/rain-hero.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-10 text-white">
          <RainMark size="lg" className="!text-white" />
          <p className="max-w-xs text-[14px] leading-snug text-white/80">
            New hire laptop store
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex items-center justify-center px-6 py-12">
        <Suspense fallback={null}>
          <StorefrontLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
