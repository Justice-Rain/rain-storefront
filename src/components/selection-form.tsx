"use client";

import { useMemo, useState } from "react";

import {
  CATEGORY_LABEL,
  laptopsInCategory,
  standardLaptops,
  type LaptopConfig,
  laptops,
} from "@/lib/catalog";

type Status = "idle" | "submitting" | "success" | "error";
type RequestType = "standard_approved" | "upgrade_request";

const MIN_REASON = 10;

const macLaptops = laptopsInCategory("mac");
const winLaptops = laptopsInCategory("windows");

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function SelectionForm() {
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMac, setOpenMac] = useState(true);
  const [openWin, setOpenWin] = useState(false);

  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [screen, setScreen] = useState("");
  const [configNotes, setConfigNotes] = useState("");
  const [standardScreen, setStandardScreen] = useState("");
  const [reason, setReason] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const selected = useMemo<LaptopConfig | null>(
    () => laptops.find((l) => l.id === selectedId) ?? null,
    [selectedId],
  );

  const reasonT = reason.trim();
  const nameT = name.trim();
  const emailT = email.trim();
  const addressT = address.trim();

  const isUpgrade = requestType === "upgrade_request";
  const isStandardApproval = requestType === "standard_approved";
  const reasonOk = !isUpgrade || reasonT.length >= MIN_REASON;
  const standardScreenOk =
    !isStandardApproval ||
    selected?.id !== "macbook-pro-14-16" ||
    standardScreen.length > 0;
  const nameOk = nameT.length > 1;
  const emailOk = /\S+@\S+\.\S+/.test(emailT);
  const addressOk = addressT.length > 8;
  const isValid =
    !!requestType &&
    !!selected &&
    reasonOk &&
    standardScreenOk &&
    nameOk &&
    emailOk &&
    addressOk;

  function selectLaptop(id: string) {
    setRequestType("upgrade_request");
    setSelectedId(id);
    const cat = laptops.find((l) => l.id === id)?.category;
    if (cat === "mac") setOpenMac(true);
    else if (cat === "windows") setOpenWin(true);
  }

  function approveStandard(id: string) {
    setRequestType("standard_approved");
    setSelectedId(id);
    setOpenMac(false);
    setOpenWin(false);
    setRam("");
    setStorage("");
    setScreen("");
    setConfigNotes("");
    setReason("");
    setStandardScreen("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!isValid || !selected) return;
    setStatus("submitting");
    setErrMsg(null);
    try {
      const payload = {
        requestType,
        selection: {
          laptopId: selected.id,
          brand: selected.brand,
          modelLine: selected.modelLine,
          category: selected.category,
          baseConfig: {
            display:
              isStandardApproval && selected.id === "macbook-pro-14-16"
                ? `${standardScreen} Liquid Retina XDR`
                : selected.display,
            chip: selected.chip,
            memory: selected.memory,
            storage: selected.storage,
          },
          customRequests: {
            ram: isUpgrade ? ram.trim() || null : null,
            storage: isUpgrade ? storage.trim() || null : null,
            screenSize: isUpgrade ? screen.trim() || null : null,
            configurationNotes: isUpgrade ? configNotes.trim() || null : null,
          },
        },
        reason: isUpgrade ? reasonT : "",
        contact: {
          name: nameT,
          email: emailT,
          phone: phone.trim() || null,
          shippingAddress: addressT,
        },
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrMsg(data.error ?? "Submission failed");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrMsg("Network error — please try again.");
    }
  }

  if (status === "success" && selected) {
    const firstName = nameT.split(" ")[0] ?? "";
    return (
      <section className="overflow-hidden rounded-2xl border border-[color:var(--rain-pink)]/30 bg-[color:var(--rain-soft)]">
        <div className="rain-glow absolute pointer-events-none" aria-hidden />
        <div className="p-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rain-strong)]">
            Request received
          </p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-zinc-900">
            Thanks{firstName ? `, ${firstName}` : ""}.
          </h2>
          <p className="mt-1.5 text-[13.5px] text-zinc-600">
            We&rsquo;ll confirm shipment of your{" "}
            <strong className="text-zinc-900">{selected.brand}</strong> by email
            at <span className="text-zinc-900">{emailT}</span>.
          </p>
        </div>
      </section>
    );
  }

  const input =
    "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[14px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[color:var(--rain-pink)] focus:ring-2 focus:ring-[color:var(--rain-pink)]/25";
  const lbl = "block text-[12px] font-medium text-zinc-700";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* 1. Confirm or request */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          1 · Confirm or request
        </h2>
        <p className="text-[12.5px] leading-snug text-zinc-500">
          Choose one option total.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold text-zinc-900">
                Keep the standard Mac
              </h3>
              <p className="mt-1 text-[12.5px] leading-snug text-zinc-500">
                Recommended for most roles. This submits your standard laptop
                and shipping details.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {standardLaptops.map((laptop) => (
              <StandardApprovalOption
                key={laptop.id}
                laptop={laptop}
                checked={
                  isStandardApproval && selectedId === laptop.id
                }
                onSelect={() => approveStandard(laptop.id)}
              />
            ))}
          </div>
          {isStandardApproval && selected?.id === "macbook-pro-14-16" && (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
              <p className="text-[12px] font-medium text-zinc-700">
                Choose your MacBook Pro screen size{" "}
                <span className="text-[color:var(--rain-pink)]">*</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['14"', '16"'].map((size) => (
                  <label
                    key={size}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-[13px] font-medium transition ${
                      standardScreen === size
                        ? "border-[color:var(--rain-pink)] bg-[color:var(--rain-soft)] text-[color:var(--rain-strong)]"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="standardScreen"
                      value={size}
                      checked={standardScreen === size}
                      onChange={() => setStandardScreen(size)}
                      className="sr-only"
                    />
                    {size}
                  </label>
                ))}
              </div>
              {attempted && !standardScreenOk && (
                <p className="mt-2 text-[11px] text-rose-600">
                  Please choose 14&quot; or 16&quot;.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-snug text-amber-900">
          Requests for non-standard laptops or custom specs require manager
          approval and may not always be fulfilled. Please include a reason.
        </div>

        <LaptopGroup
          label={CATEGORY_LABEL.mac}
          laptops={macLaptops}
          open={openMac || (isUpgrade && selected?.category === "mac")}
          onToggle={() => setOpenMac((o) => !o)}
          selectedId={selectedId}
          active={isUpgrade}
          onSelect={selectLaptop}
        />
        <LaptopGroup
          label={CATEGORY_LABEL.windows}
          laptops={winLaptops}
          open={openWin || (isUpgrade && selected?.category === "windows")}
          onToggle={() => setOpenWin((o) => !o)}
          selectedId={selectedId}
          active={isUpgrade}
          onSelect={selectLaptop}
        />
        {attempted && (!requestType || !selected) && (
          <p className="text-[12px] text-rose-600">
            Please approve a standard laptop or request another option.
          </p>
        )}
      </section>

      {/* 2. Customize + reason */}
      {isUpgrade && selected && (
        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
          <header>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              2 · Configure (manager approval required)
            </h2>
            <p className="mt-1 text-[13px] text-zinc-600">
              You&rsquo;re configuring the{" "}
              <strong className="text-zinc-900">{selected.brand}</strong>{" "}
              <span className="text-zinc-500">({selected.modelLine})</span>. The
              boxes default to the listed specs — only fill in what should
              change. Include a reason for manager review.
            </p>
          </header>

          <fieldset className="grid gap-3 sm:grid-cols-3">
            <SmallField
              label="RAM"
              placeholder={selected.memory}
              value={ram}
              onChange={setRam}
            />
            <SmallField
              label="Storage"
              placeholder={selected.storage}
              value={storage}
              onChange={setStorage}
            />
            <SmallField
              label="Screen"
              placeholder={selected.display}
              value={screen}
              onChange={setScreen}
            />
          </fieldset>

          <label className="block">
            <span className={lbl}>Configuration notes</span>
            <textarea
              value={configNotes}
              onChange={(e) => setConfigNotes(e.target.value)}
              rows={2}
              placeholder="Any other requirements or preferences"
              className={`${input} mt-1 resize-y`}
            />
          </label>

          <label className="block">
            <span className={lbl}>
              Why this instead of the standard?{" "}
              <span className="text-[color:var(--rain-pink)]">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="What do you need this laptop for, or what's missing from the standard?"
              className={`${input} mt-1 resize-y`}
            />
            {attempted && !reasonOk && (
              <p className="mt-1 text-[11px] text-rose-600">
                Add a short reason (at least {MIN_REASON} characters).
              </p>
            )}
          </label>
        </section>
      )}

      {/* 3. Shipping info */}
      {selected && (
        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
          <header>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {isUpgrade ? "3" : "2"} · Where should we ship it?
            </h2>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              required
              value={name}
              onChange={setName}
              autoComplete="name"
              error={attempted && !nameOk ? "Please enter your name." : null}
            />
            <Field
              label="Email"
              type="email"
              required
              value={email}
              onChange={setEmail}
              autoComplete="email"
              error={
                attempted && !emailOk ? "Please enter a valid email." : null
              }
            />
            <Field
              label="Phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
              hint="Optional"
              error={null}
            />
          </div>

          <label className="block">
            <span className={lbl}>
              Shipping address{" "}
              <span className="text-[color:var(--rain-pink)]">*</span>
            </span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              autoComplete="street-address"
              placeholder="Street, city, state / region, postal code, country"
              className={`${input} mt-1 resize-y`}
            />
            {attempted && !addressOk && (
              <p className="mt-1 text-[11px] text-rose-600">
                Please share a full shipping address.
              </p>
            )}
          </label>
        </section>
      )}

      {errMsg && (
        <p
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700"
          role="alert"
        >
          {errMsg}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selected || status === "submitting"}
          className="rounded-md bg-[color:var(--rain-pink)] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[color:var(--rain-pink-600)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}

/* — helpers — */

type LaptopGroupProps = {
  label: string;
  laptops: LaptopConfig[];
  open: boolean;
  onToggle: () => void;
  selectedId: string | null;
  active: boolean;
  onSelect: (id: string) => void;
};

function LaptopGroup({
  label,
  laptops,
  open,
  onToggle,
  selectedId,
  active,
  onSelect,
}: LaptopGroupProps) {
  const selectedInGroup = active
    ? laptops.find((l) => l.id === selectedId)
    : null;
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition ${
        selectedInGroup
          ? "border-[color:var(--rain-pink)]/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(255,46,116,0.25)]"
          : "border-zinc-200/90"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-[color:var(--rain-soft)]/50"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-2.5">
          <span className="text-[14px] font-semibold tracking-tight text-zinc-900">
            {label}
          </span>
          {selectedInGroup ? (
            <span className="rounded-full bg-[color:var(--rain-soft)] px-1.5 py-0.5 text-[10.5px] font-medium text-[color:var(--rain-strong)]">
              {selectedInGroup.brand}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10.5px] font-medium text-zinc-500">
              {laptops.length}
            </span>
          )}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="flex flex-col gap-1.5 border-t border-zinc-100 bg-zinc-50/50 p-2">
          {laptops.map((l) => (
            <LaptopOption
              key={l.id}
              laptop={l}
              checked={active && selectedId === l.id}
              onSelect={() => onSelect(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StandardApprovalOption({
  laptop,
  checked,
  onSelect,
}: {
  laptop: LaptopConfig;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
        checked
          ? "border-[color:var(--rain-pink)]/45 bg-[color:var(--rain-soft)] ring-2 ring-[color:var(--rain-pink)]/25"
          : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <input
        type="radio"
        name="laptopSelection"
        value={laptop.id}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-[color:var(--rain-pink)]"
      />
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold leading-tight text-zinc-900">
          {laptop.brand}
        </p>
        <p className="mt-0.5 text-[11.5px] text-zinc-600">
          Standard for {laptop.teamStandard}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-zinc-500">
          {laptop.chip} · {laptop.memory} · {laptop.storage}
        </p>
      </div>
    </label>
  );
}

function LaptopOption({
  laptop,
  checked,
  onSelect,
}: {
  laptop: LaptopConfig;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition ${
        checked
          ? "bg-white ring-2 ring-[color:var(--rain-pink)]/45"
          : "hover:bg-white"
      }`}
    >
      <input
        type="radio"
        name="laptopSelection"
        value={laptop.id}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-[color:var(--rain-pink)]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[14px] font-semibold leading-tight text-zinc-900">
            {laptop.brand}
          </p>
          {laptop.priceUsd != null && (
            <p className="shrink-0 text-[12px] font-medium tabular-nums text-zinc-500">
              {usdFmt.format(laptop.priceUsd)}
            </p>
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-zinc-600">
          {laptop.modelLine}
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          {laptop.chip} · {laptop.memory} · {laptop.storage} · {laptop.display}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {laptop.teamStandard && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--rain-pink)]">
              Standard for {laptop.teamStandard}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`text-zinc-400 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmallField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-zinc-600">
        {label}
      </span>
      <input
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[13px] outline-none transition placeholder:text-zinc-400 focus:border-[color:var(--rain-pink)] focus:ring-2 focus:ring-[color:var(--rain-pink)]/25"
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  error,
  type = "text",
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error: string | null;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[12px] font-medium text-zinc-700">
        <span>
          {label}
          {required && (
            <span className="text-[color:var(--rain-pink)]"> *</span>
          )}
        </span>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[14px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[color:var(--rain-pink)] focus:ring-2 focus:ring-[color:var(--rain-pink)]/25"
      />
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </label>
  );
}
