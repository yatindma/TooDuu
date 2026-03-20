import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import config from "../config";

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function getUserFromCookie(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(config.auth.cookieName)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, config.auth.secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function createAuthToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(config.auth.tokenExpiry)
    .sign(config.auth.secret);
}

