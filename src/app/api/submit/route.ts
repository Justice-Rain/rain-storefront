import { NextResponse } from "next/server";

type SubmitPayload = {
  requestType?: "standard_approved" | "upgrade_request";
  selection?: {
    laptopId?: string;
    brand?: string;
    modelLine?: string;
    category?: string;
    standardScreenSize?: string | null;
    baseConfig?: Record<string, string>;
    customRequests?: {
      ram?: string | null;
      storage?: string | null;
      screenSize?: string | null;
      configurationNotes?: string | null;
    };
  };
  reason?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string | null;
    shippingAddress?: string;
  };
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MACBOOK_PRO_STANDARD_ID = "macbook-pro-14-16";
const MACBOOK_PRO_SCREEN_SIZES = new Set(['14"', '16"']);

function selectedScreenSize(p: SubmitPayload): string {
  return (
    p.selection?.standardScreenSize ??
    p.selection?.customRequests?.screenSize ??
    ""
  );
}

function plainText(p: SubmitPayload): string {
  const lines: string[] = [];
  const c = p.contact ?? {};
  const s = p.selection ?? {};
  const r = s.customRequests;

  lines.push("NEW HIRE LAPTOP REQUEST");
  lines.push(`Type:    ${p.requestType ?? "unknown"}`);
  lines.push("");
  lines.push(`Name:    ${c.name ?? ""}`);
  lines.push(`Email:   ${c.email ?? ""}`);
  if (c.phone) lines.push(`Phone:   ${c.phone}`);
  lines.push("");
  lines.push("Shipping address:");
  lines.push((c.shippingAddress ?? "").trim());
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`Laptop:    ${s.brand ?? ""} (${s.modelLine ?? ""})`);
  lines.push(`Category:  ${s.category ?? ""}`);
  if (s.standardScreenSize) {
    lines.push(`Screen size: ${s.standardScreenSize}`);
  }
  if (s.baseConfig) {
    lines.push("");
    lines.push("Base configuration:");
    for (const [k, v] of Object.entries(s.baseConfig)) {
      lines.push(`  ${k}: ${v}`);
    }
  }
  if (r && (r.ram || r.storage || r.screenSize || r.configurationNotes)) {
    lines.push("");
    lines.push("Requested changes:");
    if (r.ram) lines.push(`  RAM:     ${r.ram}`);
    if (r.storage) lines.push(`  Storage: ${r.storage}`);
    if (r.screenSize) lines.push(`  Screen:  ${r.screenSize}`);
    if (r.configurationNotes) {
      lines.push(`  Notes:   ${r.configurationNotes}`);
    }
  }
  if (p.requestType === "standard_approved") {
    lines.push("");
    lines.push("Requested changes:");
    lines.push(`  ${customRequestsLine(p)}`);
  }
  lines.push("");
  lines.push("Reason:");
  lines.push((p.reason ?? "").trim() || "(not required)");
  return lines.join("\n");
}

function htmlBody(p: SubmitPayload): string {
  const c = p.contact ?? {};
  const s = p.selection ?? {};
  const r = s.customRequests;
  const base = s.baseConfig ?? {};
  const screenSize = selectedScreenSize(p);
  const overrideList =
    p.requestType === "standard_approved"
      ? `<h3 style="margin:24px 0 8px;">Requested changes</h3>
         <p style="margin:0;font-size:14px;">${esc(customRequestsLine(p))}</p>`
      : r && (r.ram || r.storage || r.screenSize || r.configurationNotes)
      ? `<h3 style="margin:24px 0 8px;">Requested changes</h3>
         <ul style="margin:0;padding-left:18px;">
           ${[
             r.ram ? `<li><strong>RAM:</strong> ${esc(r.ram)}</li>` : "",
             r.storage
               ? `<li><strong>Storage:</strong> ${esc(r.storage)}</li>`
               : "",
             r.screenSize
               ? `<li><strong>Screen:</strong> ${esc(r.screenSize)}</li>`
               : "",
             r.configurationNotes
               ? `<li><strong>Notes:</strong> ${esc(r.configurationNotes)}</li>`
               : "",
           ].join("")}
         </ul>`
      : "";

  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0b0b0c;max-width:600px;margin:0 auto;padding:24px;">
  <p style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ff2e74;font-weight:600;">New hire laptop</p>
  <h1 style="margin:4px 0 16px;font-size:22px;">${esc(c.name ?? "Unknown")}</h1>
  <p style="margin:0;">
    <a href="mailto:${esc(c.email ?? "")}" style="color:#ff2e74;text-decoration:none;">${esc(c.email ?? "")}</a>
    ${c.phone ? `<br><span style="color:#71717a;">${esc(c.phone)}</span>` : ""}
  </p>
  <p style="margin:16px 0 0;white-space:pre-wrap;background:#f4f4f5;border-radius:8px;padding:12px 14px;font-size:13px;">${esc(
    c.shippingAddress ?? "",
  )}</p>

  <h3 style="margin:24px 0 4px;font-size:16px;">${esc(s.brand ?? "")}</h3>
  <p style="margin:0;color:#71717a;font-size:13px;">${esc(s.modelLine ?? "")}</p>
  <table style="margin-top:8px;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:2px 12px 2px 0;color:#71717a;">Chip</td><td>${esc(base.chip ?? "")}</td></tr>
    <tr><td style="padding:2px 12px 2px 0;color:#71717a;">Memory</td><td>${esc(base.memory ?? "")}</td></tr>
    <tr><td style="padding:2px 12px 2px 0;color:#71717a;">Storage</td><td>${esc(base.storage ?? "")}</td></tr>
    ${screenSize ? `<tr><td style="padding:2px 12px 2px 0;color:#71717a;">Screen size</td><td>${esc(screenSize)}</td></tr>` : ""}
    <tr><td style="padding:2px 12px 2px 0;color:#71717a;">Display</td><td>${esc(base.display ?? "")}</td></tr>
  </table>
  ${overrideList}

  <h3 style="margin:24px 0 8px;font-size:16px;">Reason</h3>
  <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.5;">${esc(p.reason ?? "")}</p>
</body></html>`.trim();
}

function subjectFor(p: SubmitPayload): string {
  const who = p.contact?.name ?? "Unknown";
  const what = p.selection?.brand ?? "";
  const prefix =
    p.requestType === "standard_approved"
      ? "Standard laptop approved"
      : "New laptop request";
  return `${prefix} — ${who}${what ? ` — ${what}` : ""}`;
}

async function sendViaResend(
  p: SubmitPayload,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.STOREFRONT_RESEND_API_KEY;
  const to = process.env.STOREFRONT_NOTIFY_EMAIL;
  const from =
    process.env.STOREFRONT_FROM_EMAIL ??
    "Rain Storefront <onboarding@resend.dev>";
  if (!apiKey || !to) return { ok: false, error: "Resend not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: p.contact?.email,
      subject: subjectFor(p),
      text: plainText(p),
      html: htmlBody(p),
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, error: `Resend ${res.status}: ${t}` };
  }
  return { ok: true };
}

function customRequestsLine(p: SubmitPayload): string {
  if (p.requestType === "standard_approved") {
    const screenSize = selectedScreenSize(p);
    return screenSize
      ? `Standard approved — screen size: ${screenSize}`
      : "Standard approved — no changes requested.";
  }
  const r = p.selection?.customRequests;
  if (!r) return "";
  const parts: string[] = [];
  if (r.ram) parts.push(`RAM: ${r.ram}`);
  if (r.storage) parts.push(`Storage: ${r.storage}`);
  if (r.screenSize) parts.push(`Screen: ${r.screenSize}`);
  if (r.configurationNotes) parts.push(`Notes: ${r.configurationNotes}`);
  return parts.join(" · ");
}

/**
 * Submit to a Google Form. Set STOREFRONT_GOOGLE_FORM_URL to the form's
 * `formResponse` URL, then map any of these fields via env vars:
 *
 *   STOREFRONT_GOOGLE_FORM_ENTRY_NAME=entry.123...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_EMAIL=entry.234...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_PHONE=entry.345...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_ADDRESS=entry.456...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_LAPTOP=entry.567...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_SCREEN_SIZE=entry.678...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_REQUESTS=entry.789...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_REASON=entry.890...
 *   STOREFRONT_GOOGLE_FORM_ENTRY_SUMMARY=entry.901...
 *
 * Only the entries you map will be sent. The "summary" field is a full
 * plain-text dump for forms that just have one big "details" question.
 */
async function sendViaGoogleForm(
  p: SubmitPayload,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.STOREFRONT_GOOGLE_FORM_URL;
  if (!url) return { ok: false, error: "Google Form URL not set" };

  const values: Record<string, string> = {
    NAME: p.contact?.name ?? "",
    EMAIL: p.contact?.email ?? "",
    PHONE: p.contact?.phone ?? "",
    ADDRESS: p.contact?.shippingAddress ?? "",
    LAPTOP: `${p.selection?.brand ?? ""}${
      p.selection?.modelLine ? ` (${p.selection.modelLine})` : ""
    }`,
    SCREEN_SIZE: selectedScreenSize(p),
    REQUESTS: customRequestsLine(p),
    REASON: p.reason ?? "",
    SUMMARY: plainText(p),
  };

  const form = new URLSearchParams();
  let mapped = 0;
  for (const key of Object.keys(values)) {
    const envKey = `STOREFRONT_GOOGLE_FORM_ENTRY_${key}`;
    const entryId = process.env[envKey];
    if (entryId) {
      form.set(entryId, values[key]);
      mapped++;
    }
  }

  if (mapped === 0) {
    return {
      ok: false,
      error:
        "No Google Form field mappings configured (set at least one STOREFRONT_GOOGLE_FORM_ENTRY_*).",
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Google sometimes blocks requests with no UA
      "User-Agent": "RainStorefront/1.0 (+vercel)",
    },
    body: form.toString(),
    // Google responds with 200 + HTML on success; treat redirects as success too
    redirect: "follow",
  });

  if (res.status >= 200 && res.status < 400) {
    return { ok: true };
  }
  const text = await res.text().catch(() => "");
  return { ok: false, error: `Google Form ${res.status}: ${text.slice(0, 120)}` };
}

async function sendViaFormEndpoint(
  p: SubmitPayload,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.STOREFRONT_FORM_ENDPOINT;
  if (!url) return { ok: false, error: "Form endpoint not set" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subjectFor(p),
      submittedAt: new Date().toISOString(),
      ...p,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, error: `Form endpoint ${res.status}: ${t}` };
  }
  return { ok: true };
}

function validate(p: SubmitPayload): string | null {
  if (!p.selection?.laptopId) return "Please pick a laptop.";
  if (
    p.requestType === "standard_approved" &&
    p.selection.laptopId === MACBOOK_PRO_STANDARD_ID &&
    !MACBOOK_PRO_SCREEN_SIZES.has(p.selection.standardScreenSize ?? "")
  ) {
    return "Please choose a MacBook Pro screen size.";
  }
  if (
    p.requestType !== "standard_approved" &&
    (!p.reason || p.reason.trim().length < 5)
  )
    return "Please include a reason.";
  const c = p.contact ?? {};
  if (!c.name?.trim()) return "Please include your name.";
  if (!c.email || !/\S+@\S+\.\S+/.test(c.email))
    return "Please include a valid email.";
  if (!c.shippingAddress?.trim()) return "Please include a shipping address.";
  return null;
}

export async function POST(request: Request) {
  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const senders: Array<{
    name: string;
    enabled: boolean;
    send: () => Promise<{ ok: boolean; error?: string }>;
  }> = [
    {
      name: "resend",
      enabled: !!(
        process.env.STOREFRONT_RESEND_API_KEY &&
        process.env.STOREFRONT_NOTIFY_EMAIL
      ),
      send: () => sendViaResend(body),
    },
    {
      name: "google-form",
      enabled: !!process.env.STOREFRONT_GOOGLE_FORM_URL,
      send: () => sendViaGoogleForm(body),
    },
    {
      name: "form-endpoint",
      enabled: !!process.env.STOREFRONT_FORM_ENDPOINT,
      send: () => sendViaFormEndpoint(body),
    },
  ];

  const enabled = senders.filter((s) => s.enabled);
  if (enabled.length === 0) {
    console.info(
      "[submit] No email/form provider configured — payload:\n" +
        plainText(body),
    );
    return NextResponse.json({
      ok: true,
      note: "Logged to server console (no provider configured)",
    });
  }

  const errors: string[] = [];
  let anyOk = false;
  for (const s of enabled) {
    const r = await s.send();
    if (r.ok) {
      anyOk = true;
    } else {
      console.error(`[submit] ${s.name} failed`, r.error);
      errors.push(`${s.name}: ${r.error ?? "unknown"}`);
    }
  }

  if (!anyOk) {
    return NextResponse.json(
      { error: "Could not deliver the request.", detail: errors.join("; ") },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
