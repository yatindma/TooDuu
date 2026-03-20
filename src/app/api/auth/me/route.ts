import { NextResponse } from "next/server";
import { getUserFromCookie, userRepository, checkRateLimit, rateLimitResponse } from "@/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const auth = await getUserFromCookie();
    if (!auth) {
      return NextResponse.json({ user: null });
    }

    const user = userRepository.findById(auth.userId);
    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
