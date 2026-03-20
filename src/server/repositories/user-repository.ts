import { db } from "../db";
import type { IUserRepository, UserRow } from "./types";

class UserRepository implements IUserRepository {
  private readonly stmts = {
    findByEmail: db.prepare<[string], UserRow>(
      "SELECT id, email, name, password, created_at FROM users WHERE email = ?"
    ),
    findById: db.prepare<[string], Omit<UserRow, "password">>(
      "SELECT id, email, name, created_at FROM users WHERE id = ?"
    ),
    create: db.prepare<[string, string, string, string]>(
      "INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)"
    ),
  };

  findByEmail(email: string): UserRow | undefined {
    return this.stmts.findByEmail.get(email);
  }

  findById(id: string): Omit<UserRow, "password"> | undefined {
    return this.stmts.findById.get(id);
  }

  create(id: string, email: string, name: string, hashedPassword: string): void {
    this.stmts.create.run(id, email, name, hashedPassword);
  }
}

export const userRepository: IUserRepository = new UserRepository();
