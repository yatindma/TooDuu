import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  todoRepository,
  getUserFromCookie,
  checkRateLimit,
  rateLimitResponse,
  validateBody,
  createTodoSchema,
  patchTodoSchema,
  deleteTodoSchema,
} from "@/server";
import type { TodoRow } from "@/server";

export const dynamic = "force-dynamic";

function formatTodo(t: TodoRow) {
  return {
    id: t.id,
    text: t.text,
    completed: !!t.completed,
    date: t.date,
    createdAt: t.created_at,
  };
}

// GET /api/todos?startDate=&endDate=&search=&status=&limit=&offset=
export async function GET(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") as "done" | "pending" | "all" | null;
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");

  // If search/status/limit params present, use the flexible query method
  if (search || status || limitStr) {
    const result = todoRepository.query(auth.userId, {
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      search,
      status: status ?? "all",
      limit: limitStr ? parseInt(limitStr, 10) : 20,
      offset: offsetStr ? parseInt(offsetStr, 10) : 0,
    });

    return NextResponse.json({
      todos: result.todos.map(formatTodo),
      total: result.total,
      truncated: result.total > result.todos.length,
      remaining: Math.max(0, result.total - result.todos.length - (offsetStr ? parseInt(offsetStr, 10) : 0)),
    });
  }

  // Legacy: simple date range or all
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const todos =
    startDate && endDate
      ? todoRepository.findByUserAndDateRange(auth.userId, startDate, endDate)
      : todoRepository.findAllByUser(auth.userId);

  return NextResponse.json({ todos: todos.map(formatTodo) });
}

// POST /api/todos
export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await validateBody(req, createTodoSchema);
  if ("error" in parsed) return parsed.error;

  const { text, date } = parsed.data;
  const id = randomUUID();
  const todo = todoRepository.create(id, text, date, auth.userId);

  return NextResponse.json({ todo: formatTodo(todo) });
}

// PATCH /api/todos — toggle, move, or edit
export async function PATCH(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await validateBody(req, patchTodoSchema);
  if ("error" in parsed) return parsed.error;

  const { id, newDate, newText } = parsed.data;

  const existing = todoRepository.findById(id, auth.userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (newDate) {
    todoRepository.updateDate(id, auth.userId, newDate);
  } else if (newText) {
    todoRepository.updateText(id, auth.userId, newText);
  } else {
    todoRepository.toggleCompleted(id, existing.completed);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/todos
export async function DELETE(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = await validateBody(req, deleteTodoSchema);
  if ("error" in parsed) return parsed.error;

  todoRepository.delete(parsed.data.id, auth.userId);

  return NextResponse.json({ ok: true });
}
