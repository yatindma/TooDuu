import { NextResponse } from "next/server";
import { config } from "@/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(config.auth.cookieName, "", { maxAge: 0, path: "/" });
  return res;
}
