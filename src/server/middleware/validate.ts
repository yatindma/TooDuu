import { NextResponse } from "next/server";
import { type ZodSchema, ZodError } from "zod";

export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues.map((e) => e.message).join(", ");
      return {
        error: NextResponse.json({ error: message }, { status: 400 }),
      };
    }
    return {
      error: NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
    };
  }
}

