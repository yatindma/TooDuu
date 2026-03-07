"use client";

import { useCallback, useState } from "react";
import type { Todo } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

// =============================================
// LOCAL STORAGE helpers (for anonymous users)
// =============================================
function getStorageKey(date: string): string {
  return `todos-${date}`;
}

function readLocal(date: string): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(date));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(date: string, todos: Todo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(date), JSON.stringify(todos));
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// =============================================
// HOOK
// =============================================
function useTodos() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [todosByDate, setTodosByDate] = useState<Record<string, Todo[]>>({});

  // Load date range
  const loadDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (isLoggedIn) {
        // Fetch from API
        try {
          const res = await fetch(`/api/todos?startDate=${startDate}&endDate=${endDate}`);
          const data = await res.json();
          if (data.todos) {
            const grouped: Record<string, Todo[]> = {};
            // Initialize all dates in range
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              grouped[key] = [];
            }
            // Group todos by date
            for (const todo of data.todos) {
              if (!grouped[todo.date]) grouped[todo.date] = [];
              grouped[todo.date].push({
                id: todo.id,
                text: todo.text,
                completed: todo.completed,
                createdAt: todo.createdAt,
              });
            }
            setTodosByDate((prev) => ({ ...prev, ...grouped }));
          }
        } catch {
          // Fallback: load from localStorage
          loadLocalRange(startDate, endDate);
        }
      } else {
        loadLocalRange(startDate, endDate);
      }
    },
    [isLoggedIn]
  );

  const loadLocalRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const loaded: Record<string, Todo[]> = {};
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      loaded[dateStr] = readLocal(dateStr);
    }
    setTodosByDate((prev) => ({ ...prev, ...loaded }));
  };

  const getTodosForDate = useCallback(
    (date: string): Todo[] => todosByDate[date] ?? [],
    [todosByDate]
  );

  const addTodo = useCallback(
    async (date: string, text: string) => {
      if (isLoggedIn) {
        try {
          const res = await fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, date }),
          });
          const data = await res.json();
          if (data.todo) {
            const newTodo: Todo = {
              id: data.todo.id,
              text: data.todo.text,
              completed: data.todo.completed,
              createdAt: data.todo.createdAt,
            };
            setTodosByDate((prev) => ({
              ...prev,
              [date]: [...(prev[date] ?? []), newTodo],
            }));
          }
        } catch {
          addLocalTodo(date, text);
        }
      } else {
        addLocalTodo(date, text);
      }
    },
    [isLoggedIn]
  );

  const addLocalTodo = (date: string, text: string) => {
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodosByDate((prev) => {
      const existing = prev[date] ?? readLocal(date);
      const updated = [...existing, newTodo];
      writeLocal(date, updated);
      return { ...prev, [date]: updated };
    });
  };

  const toggleTodo = useCallback(
    async (date: string, id: string) => {
      if (isLoggedIn) {
        // Optimistic update
        setTodosByDate((prev) => {
          const updated = (prev[date] ?? []).map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
          return { ...prev, [date]: updated };
        });
        try {
          await fetch("/api/todos", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
        } catch {
          // Revert on failure
          setTodosByDate((prev) => {
            const reverted = (prev[date] ?? []).map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            );
            return { ...prev, [date]: reverted };
          });
        }
      } else {
        setTodosByDate((prev) => {
          const existing = prev[date] ?? readLocal(date);
          const updated = existing.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
          writeLocal(date, updated);
          return { ...prev, [date]: updated };
        });
      }
    },
    [isLoggedIn]
  );

  const deleteTodo = useCallback(
    async (date: string, id: string) => {
      if (isLoggedIn) {
        // Optimistic
        setTodosByDate((prev) => {
          const updated = (prev[date] ?? []).filter((t) => t.id !== id);
          return { ...prev, [date]: updated };
        });
        try {
          await fetch("/api/todos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
        } catch {
          // If failed, could reload but for now just leave it
        }
      } else {
        setTodosByDate((prev) => {
          const existing = prev[date] ?? readLocal(date);
          const updated = existing.filter((t) => t.id !== id);
          writeLocal(date, updated);
          return { ...prev, [date]: updated };
        });
      }
    },
    [isLoggedIn]
  );

  const moveTodo = useCallback(
    async (sourceDate: string, todoId: string, targetDate: string) => {
      if (isLoggedIn) {
        // Optimistic update
        let movedTodo: Todo | undefined;
        setTodosByDate((prev) => {
          const sourceList = prev[sourceDate] ?? [];
          movedTodo = sourceList.find((t) => t.id === todoId);
          if (!movedTodo) return prev;
          const updatedSource = sourceList.filter((t) => t.id !== todoId);
          const updatedTarget = [...(prev[targetDate] ?? []), movedTodo];
          return { ...prev, [sourceDate]: updatedSource, [targetDate]: updatedTarget };
        });
        try {
          await fetch("/api/todos", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: todoId, newDate: targetDate }),
          });
        } catch {
          // Revert on failure
          setTodosByDate((prev) => {
            if (!movedTodo) return prev;
            const revertedTarget = (prev[targetDate] ?? []).filter((t) => t.id !== todoId);
            const revertedSource = [...(prev[sourceDate] ?? []), movedTodo];
            return { ...prev, [sourceDate]: revertedSource, [targetDate]: revertedTarget };
          });
        }
      } else {
        setTodosByDate((prev) => {
          const sourceList = prev[sourceDate] ?? readLocal(sourceDate);
          const movedTodo = sourceList.find((t) => t.id === todoId);
          if (!movedTodo) return prev;
          const updatedSource = sourceList.filter((t) => t.id !== todoId);
          const targetList = prev[targetDate] ?? readLocal(targetDate);
          const updatedTarget = [...targetList, movedTodo];
          writeLocal(sourceDate, updatedSource);
          writeLocal(targetDate, updatedTarget);
          return { ...prev, [sourceDate]: updatedSource, [targetDate]: updatedTarget };
        });
      }
    },
    [isLoggedIn]
  );

  const editTodo = useCallback(
    async (date: string, todoId: string, newText: string) => {
      if (isLoggedIn) {
        // Optimistic update
        let oldText: string | undefined;
        setTodosByDate((prev) => {
          const list = prev[date] ?? [];
          const todo = list.find((t) => t.id === todoId);
          if (todo) oldText = todo.text;
          const updated = list.map((t) =>
            t.id === todoId ? { ...t, text: newText } : t
          );
          return { ...prev, [date]: updated };
        });
        try {
          await fetch("/api/todos", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: todoId, newText }),
          });
        } catch {
          // Revert on failure
          if (oldText !== undefined) {
            setTodosByDate((prev) => {
              const reverted = (prev[date] ?? []).map((t) =>
                t.id === todoId ? { ...t, text: oldText as string } : t
              );
              return { ...prev, [date]: reverted };
            });
          }
        }
      } else {
        setTodosByDate((prev) => {
          const existing = prev[date] ?? readLocal(date);
          const updated = existing.map((t) =>
            t.id === todoId ? { ...t, text: newText } : t
          );
          writeLocal(date, updated);
          return { ...prev, [date]: updated };
        });
      }
    },
    [isLoggedIn]
  );

  const clearTodos = useCallback(() => {
    setTodosByDate({});
  }, []);

  return {
    todosByDate,
    loadDateRange,
    getTodosForDate,
    addTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    editTodo,
    clearTodos,
  };
}

export default useTodos;
