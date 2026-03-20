import { db } from "../db";
import type { ITodoRepository, TodoRow, TodoQuery, TodoQueryResult } from "./types";

class TodoRepository implements ITodoRepository {
  private readonly stmts = {
    findByRange: db.prepare<[string, string, string], TodoRow>(
      "SELECT id, text, completed, date, user_id, created_at FROM todos WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY created_at ASC"
    ),
    findAll: db.prepare<[string], TodoRow>(
      "SELECT id, text, completed, date, user_id, created_at FROM todos WHERE user_id = ? ORDER BY created_at ASC"
    ),
    findById: db.prepare<[string, string], TodoRow>(
      "SELECT id, text, completed, date, user_id, created_at FROM todos WHERE id = ? AND user_id = ?"
    ),
    insert: db.prepare<[string, string, string, string]>(
      "INSERT INTO todos (id, text, date, user_id) VALUES (?, ?, ?, ?)"
    ),
    getById: db.prepare<[string], TodoRow>(
      "SELECT id, text, completed, date, user_id, created_at FROM todos WHERE id = ?"
    ),
    toggleCompleted: db.prepare<[number, string]>(
      "UPDATE todos SET completed = ? WHERE id = ?"
    ),
    updateDate: db.prepare<[string, string, string]>(
      "UPDATE todos SET date = ? WHERE id = ? AND user_id = ?"
    ),
    updateText: db.prepare<[string, string, string]>(
      "UPDATE todos SET text = ? WHERE id = ? AND user_id = ?"
    ),
    delete: db.prepare<[string, string]>(
      "DELETE FROM todos WHERE id = ? AND user_id = ?"
    ),
  };

  findByUserAndDateRange(userId: string, startDate: string, endDate: string): TodoRow[] {
    return this.stmts.findByRange.all(userId, startDate, endDate);
  }

  findAllByUser(userId: string): TodoRow[] {
    return this.stmts.findAll.all(userId);
  }

  findById(id: string, userId: string): TodoRow | undefined {
    return this.stmts.findById.get(id, userId);
  }

  query(userId: string, params: TodoQuery): TodoQueryResult {
    const conditions: string[] = ["user_id = ?"];
    const bindings: (string | number)[] = [userId];

    if (params.startDate) {
      conditions.push("date >= ?");
      bindings.push(params.startDate);
    }
    if (params.endDate) {
      conditions.push("date <= ?");
      bindings.push(params.endDate);
    }
    if (params.search) {
      conditions.push("LOWER(text) LIKE ?");
      bindings.push(`%${params.search.toLowerCase()}%`);
    }
    if (params.status === "done") {
      conditions.push("completed = 1");
    } else if (params.status === "pending") {
      conditions.push("completed = 0");
    }

    const where = conditions.join(" AND ");
    const limit = Math.min(params.limit ?? 20, 50);
    const offset = params.offset ?? 0;

    const countRow = db
      .prepare<(string | number)[], { cnt: number }>(`SELECT COUNT(*) as cnt FROM todos WHERE ${where}`)
      .get(...bindings);
    const total = countRow?.cnt ?? 0;

    const todos = db
      .prepare<(string | number)[], TodoRow>(
        `SELECT id, text, completed, date, user_id, created_at FROM todos WHERE ${where} ORDER BY date DESC, created_at ASC LIMIT ? OFFSET ?`
      )
      .all(...bindings, limit, offset);

    return { todos, total };
  }

  create(id: string, text: string, date: string, userId: string): TodoRow {
    this.stmts.insert.run(id, text, date, userId);
    return this.stmts.getById.get(id)!;
  }

  toggleCompleted(id: string, currentCompleted: number): void {
    this.stmts.toggleCompleted.run(currentCompleted ? 0 : 1, id);
  }

  updateDate(id: string, userId: string, newDate: string): void {
    this.stmts.updateDate.run(newDate, id, userId);
  }

  updateText(id: string, userId: string, newText: string): void {
    this.stmts.updateText.run(newText, id, userId);
  }

  delete(id: string, userId: string): void {
    this.stmts.delete.run(id, userId);
  }
}

export const todoRepository: ITodoRepository = new TodoRepository();
