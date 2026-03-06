import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret");

export async function getUserFromCookie(): Promise<{ userId: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string, email: payload.email as string };
  } catch {
    return null;
  }
}
