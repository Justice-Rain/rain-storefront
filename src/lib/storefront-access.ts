import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "storefront-access";

export { COOKIE_NAME };

function getEncodedSecret(): Uint8Array | null {
  const secret = process.env.STOREFRONT_SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function createAccessToken(): Promise<string> {
  const key = getEncodedSecret();
  if (!key) {
    throw new Error("STOREFRONT_SESSION_SECRET is not configured");
  }
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setSubject("storefront")
    .sign(key);
}

export async function isValidAccessToken(token: string): Promise<boolean> {
  const key = getEncodedSecret();
  if (!key) return false;
  try {
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}
