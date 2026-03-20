import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  userRepository,
  checkRateLimit,
  rateLimitResponse,
  validateBody,
  registerSchema,
  config,
} from "@/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = checkRateLimit(req, config.rateLimit.authMaxRequests);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const parsed = await validateBody(req, registerSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const { email, password, name } = parsed.data;

    const existing = userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, config.auth.saltRounds);
    const id = randomUUID();
    const displayName = name || email.split("@")[0];

    userRepository.create(id, email, displayName, hashed);

    return NextResponse.json({ id, email, name: displayName });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
