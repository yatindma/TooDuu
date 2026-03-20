import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().max(100).optional(),
});

export const createTodoSchema = z.object({
  text: z.string().min(1, "Task text is required").max(500, "Task text too long"),
  date: z.string().regex(DATE_REGEX, "Date must be YYYY-MM-DD format"),
});

export const patchTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
  newDate: z.string().regex(DATE_REGEX, "Date must be YYYY-MM-DD format").optional(),
  newText: z.string().min(1).max(500).optional(),
});

export const deleteTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
});
