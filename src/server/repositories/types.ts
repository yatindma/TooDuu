// Repository interfaces — swap SQLite for Postgres/Turso without touching routes

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password: string;
  created_at: string;
}

export interface TodoRow {
  id: string;
  text: string;
  completed: number;
  date: string;
  user_id: string;
  created_at: string;
}

export interface IUserRepository {
  findByEmail(email: string): UserRow | undefined;
  findById(id: string): Omit<UserRow, "password"> | undefined;
  create(id: string, email: string, name: string, hashedPassword: string): void;
}

export interface TodoQuery {
  readonly startDate?: string;
  readonly endDate?: string;
  readonly search?: string;
  readonly status?: "done" | "pending" | "all";
  readonly limit?: number;
  readonly offset?: number;
}

export interface TodoQueryResult {
  readonly todos: TodoRow[];
  readonly total: number;
}

export interface ITodoRepository {
  findByUserAndDateRange(userId: string, startDate: string, endDate: string): TodoRow[];
  findAllByUser(userId: string): TodoRow[];
  findById(id: string, userId: string): TodoRow | undefined;
  query(userId: string, params: TodoQuery): TodoQueryResult;
  create(id: string, text: string, date: string, userId: string): TodoRow;
  toggleCompleted(id: string, currentCompleted: number): void;
  updateDate(id: string, userId: string, newDate: string): void;
  updateText(id: string, userId: string, newText: string): void;
  delete(id: string, userId: string): void;
}
