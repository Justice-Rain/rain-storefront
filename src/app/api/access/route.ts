import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { COOKIE_NAME, createAccessToken } from "@/lib/storefront-access";

function passwordsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const expected = process.env.STOREFRONT_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Password login is not configured on the server." },
      { status: 503 },
    );
  }
  if (typeof body.password !== "string" || !passwordsMatch(body.password, expected)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createAccessToken();
  } catch {
    return NextResponse.json(
      { error: "Session signing is not configured on the server." },
      { status: 503 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
