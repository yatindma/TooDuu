import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromCookie } from "@/lib/get-user";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

interface TodoRow {
  id: string;
  text: string;
  completed: number;
  date: string;
  created_at: string;
}

// GET /api/todos?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function GET(req: Request) {
  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let todos: TodoRow[];
  if (startDate && endDate) {
    todos = db.prepare(
      "SELECT id, text, completed, date, created_at FROM todos WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY created_at ASC"
    ).all(auth.userId, startDate, endDate) as TodoRow[];
  } else {
    todos = db.prepare(
      "SELECT id, text, completed, date, created_at FROM todos WHERE user_id = ? ORDER BY created_at ASC"
    ).all(auth.userId) as TodoRow[];
  }

  return NextResponse.json({
    todos: todos.map((t) => ({
      id: t.id,
      text: t.text,
      completed: !!t.completed,
      date: t.date,
      createdAt: t.created_at,
    })),
  });
}

// POST /api/todos
export async function POST(req: Request) {
  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, date } = await req.json();
  if (!text || !date) {
    return NextResponse.json({ error: "text and date required" }, { status: 400 });
  }

  const id = randomUUID();
  db.prepare("INSERT INTO todos (id, text, date, user_id) VALUES (?, ?, ?, ?)").run(
    id, text, date, auth.userId
  );

  const todo = db.prepare("SELECT id, text, completed, date, created_at FROM todos WHERE id = ?").get(id) as TodoRow;

  return NextResponse.json({
    todo: { id: todo.id, text: todo.text, completed: !!todo.completed, date: todo.date, createdAt: todo.created_at },
  });
}

// PATCH /api/todos - toggle or move
export async function PATCH(req: Request) {
  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, newDate, newText } = await req.json();
  const existing = db.prepare("SELECT completed FROM todos WHERE id = ? AND user_id = ?").get(id, auth.userId) as { completed: number } | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (newDate) {
    // Move todo to a different date
    db.prepare("UPDATE todos SET date = ? WHERE id = ? AND user_id = ?").run(newDate, id, auth.userId);
  } else if (newText) {
    // Edit todo text
    db.prepare("UPDATE todos SET text = ? WHERE id = ? AND user_id = ?").run(newText, id, auth.userId);
  } else {
    // Toggle completed
    db.prepare("UPDATE todos SET completed = ? WHERE id = ?").run(existing.completed ? 0 : 1, id);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/todos
export async function DELETE(req: Request) {
  const auth = await getUserFromCookie();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").run(id, auth.userId);

  return NextResponse.json({ ok: true });
}
