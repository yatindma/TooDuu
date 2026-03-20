import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  userRepository,
  createAuthToken,
  checkRateLimit,
  rateLimitResponse,
  validateBody,
  loginSchema,
  config,
} from "@/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = checkRateLimit(req, config.rateLimit.authMaxRequests);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const parsed = await validateBody(req, loginSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const { email, password } = parsed.data;

    const user = userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createAuthToken(user.id, user.email);

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    res.cookies.set(config.auth.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: config.auth.cookieMaxAge,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
