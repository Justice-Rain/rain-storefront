"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { RainMark } from "@/components/rain-mark";

function safeNextParam(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export function StorefrontLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextParam(searchParams.get("next"));

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Incorrect password");
        setPending(false);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[20rem] space-y-5"
    >
      <div className="flex flex-col items-start gap-2 lg:hidden">
        <RainMark size="md" />
      </div>
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">
          Sign in
        </h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Enter the shared team password.
        </p>
      </div>
      <div className="space-y-2">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-[14px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[color:var(--rain-pink)] focus:ring-2 focus:ring-[color:var(--rain-pink)]/25"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-zinc-500 transition hover:text-zinc-700">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(ev) => setShowPassword(ev.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-300 accent-[color:var(--rain-pink)]"
          />
          Show password
        </label>
      </div>
      {error && (
        <p className="text-[12px] text-rose-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || password.length === 0}
        className="w-full rounded-md bg-[color:var(--rain-pink)] py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[color:var(--rain-pink-600)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "…" : "Continue"}
      </button>
    </form>
  );
}
