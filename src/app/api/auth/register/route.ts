import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = randomUUID();
    db.prepare("INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)").run(
      id, email, name || email.split("@")[0], hashed
    );

    return NextResponse.json({ id, email, name: name || email.split("@")[0] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
