import { db } from "../db";
import type { ITodoRepository, TodoRow } from "./types";

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
