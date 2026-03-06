export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO string
}

export interface DayData {
  date: string; // YYYY-MM-DD format
  todos: Todo[];
}
