"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_NAME } from "@/lib/storefront-access";

export async function endStorefrontSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/login");
}
