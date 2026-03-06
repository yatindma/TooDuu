import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret");

interface UserRow {
  id: string;
  email: string;
  name: string | null;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const { payload } = await jwtVerify(token, secret);
    const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(payload.userId as string) as UserRow | undefined;

    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
