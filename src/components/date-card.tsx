"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Plus, X, Check, Calendar, Sparkles, Pencil } from "lucide-react";
import type { Todo } from "@/lib/types";

interface DateCardProps {
  date: string;
  todos: Todo[];
  isToday: boolean;
  isPast: boolean;
  isSelected?: boolean;
  index?: number;
  onAddTodo: (date: string, text: string) => void;
  onToggleTodo: (date: string, id: string) => void;
  onDeleteTodo: (date: string, id: string) => void;
  onMoveTodo?: (sourceDate: string, todoId: string, targetDate: string) => void;
  onEditTodo?: (date: string, todoId: string, newText: string) => void;
}

function DateCard({
  date,
  todos,
  isToday,
  isPast,
  isSelected = false,
  index = 0,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onMoveTodo,
  onEditTodo,
}: DateCardProps) {
  const [inputVisible, setInputVisible] = useState(isToday);
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const dateObj = new Date(date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dateNumber = String(dateObj.getDate()).padStart(2, "0");
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const yearStr = dateObj.getFullYear().toString();

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAddTodo(date, trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setInputValue("");
      if (!isToday) setInputVisible(false);
    }
  };

  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Edit handlers
  const startEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const commitEdit = () => {
    if (editingTodoId && editText.trim() && onEditTodo) {
      onEditTodo(date, editingTodoId, editText.trim());
    }
    setEditingTodoId(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditingTodoId(null);
      setEditText("");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      todoId: todo.id,
      sourceDate: date,
      text: todo.text,
      completed: todo.completed,
    }));
    e.dataTransfer.effectAllowed = "move";
    // Style the drag ghost
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.4";
    setTimeout(() => { target.style.opacity = "1"; }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.sourceDate !== date && onMoveTodo) {
        onMoveTodo(data.sourceDate, data.todoId, date);
      }
    } catch { /* ignore invalid drops */ }
  };

  // Responsive sizes - BIGGER selected cards
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const cardWidth = isSelected ? (isMobile ? 300 : 380) : (isMobile ? 165 : 210);
  const cardMinHeight = isSelected ? (isMobile ? 340 : 440) : (isMobile ? 190 : 230);
  const active = isSelected;

  // Color scheme
  const colors = {
    dayName: isPast ? "#6abf7b" : active ? "#00ff41" : "#8fe0a0",
    dateNum: isPast ? "#5cb870" : "#00ff41",
    month: isPast ? "#6abf7b" : active ? "#00ff41" : "#8fe0a0",
    year: isPast ? "#5aaa70" : "#7dd492",
    todoText: isPast ? "#a0ddb0" : "#e8ffe8",
    todoCompleted: "#5aaa70",
    emptyIcon: isPast ? "#5aaa70" : "#6abf7b",
    emptyText: isPast ? "#5aaa70" : "#6abf7b",
    border: active
      ? "rgba(0,255,65,0.5)"
      : isDragOver
      ? "rgba(0,255,65,0.5)"
      : isHovered
      ? "rgba(0,255,65,0.3)"
      : isPast
      ? "rgba(0,255,65,0.1)"
      : "rgba(0,255,65,0.15)",
    addBtn: isPast ? "#5aaa70" : "#7dd492",
    placeholder: "#5aaa70",
    inputBorder: "rgba(0,255,65,0.35)",
    prompt: "#00ff41",
    progressTrack: "rgba(0,255,65,0.15)",
    progressCount: isPast ? "#7dd492" : "#a0ddb0",
    headerBorder: active ? "rgba(0,255,65,0.2)" : "rgba(0,255,65,0.1)",
    footerBorder: active ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.08)",
    checkBorder: "rgba(0,255,65,0.5)",
    todoBorder: "rgba(0,255,65,0.08)",
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: active ? (isMobile ? -16 : -30) : 0,
        scale: active ? 1.05 : 1,
      }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.02, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-shrink-0 flex flex-col rounded-2xl group"
      style={{
        width: cardWidth,
        minHeight: cardMinHeight,
        willChange: "transform, opacity, width",
        transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* === Animated glowing border for selected/today === */}
      {active && (
        <>
          <div
            className="absolute -inset-[2px] rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,65,0.2), rgba(0,212,255,0.05), rgba(0,255,65,0.2))",
              filter: "blur(3px)",
              opacity: 0.5,
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -inset-[1px] rounded-2xl pointer-events-none overflow-hidden"
            style={{
              background: "linear-gradient(var(--glow-angle, 0deg), rgba(0,255,65,0.7), rgba(0,212,255,0.3), rgba(0,255,65,0.7), rgba(0,255,65,0.2))",
              backgroundSize: "300% 300%",
              animation: "border-rotate 4s linear infinite",
            }}
          />
          <style>{`
            @keyframes border-rotate {
              0% { --glow-angle: 0deg; background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { --glow-angle: 360deg; background-position: 0% 50%; }
            }
          `}</style>
        </>
      )}

      {/* === Drag over highlight === */}
      {isDragOver && !active && (
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            border: "2px dashed rgba(0,255,65,0.5)",
            background: "rgba(0,255,65,0.05)",
            animation: "pulse-glow 1.5s ease-in-out infinite",
          }}
        />
      )}

      {/* === Mouse-following radial glow === */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) =>
              `radial-gradient(250px circle at ${x} ${y}, rgba(0,255,65,0.1), transparent 70%)`
          ),
          zIndex: 1,
        }}
      />

      {/* === Card border (non-selected) === */}
      {!active && !isDragOver && (
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-400"
          style={{
            border: `1px solid ${colors.border}`,
            boxShadow: isHovered
              ? "0 0 20px rgba(0,255,65,0.08), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 2px 16px rgba(0,0,0,0.3)",
          }}
        />
      )}

      {/* === Top glow aura for active cards — subtle === */}
      {active && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[200%] h-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,255,65,0.08) 0%, transparent 70%)",
            filter: "blur(20px)",
            mixBlendMode: "screen",
            zIndex: 0,
          }}
        />
      )}

      {/* === Card background === */}
      <div
        className="absolute inset-[1px] rounded-2xl overflow-hidden"
        style={{
          background: isDragOver
            ? "linear-gradient(180deg, rgba(0,255,65,0.08) 0%, #0a0e10 30%, #0a0c0f 100%)"
            : active
            ? "linear-gradient(180deg, #0b0e12 0%, #0a0e10 30%, #0a0c0f 100%)"
            : isPast
            ? "#090b0e"
            : "#0b0d12",
        }}
      />

      {/* === CONTENT === */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Compact */}
        <div
          className="flex items-center justify-between px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2"
          style={{ borderBottom: `1px solid ${colors.headerBorder}` }}
        >
          {/* Left: Date info compact */}
          <div className="flex items-center gap-2">
            {isToday && (
              <motion.span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: "#00ff41",
                  boxShadow: "0 0 6px #00ff41, 0 0 14px rgba(0,255,65,0.4)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span
              className={`font-mono font-black leading-none tracking-tight ${active ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
              style={{
                ...(active
                  ? {
                      background: "linear-gradient(180deg, #00ff41 0%, #00dd38 60%, #00aa2a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 12px rgba(0,255,65,0.5))",
                    }
                  : {
                      color: colors.dateNum,
                      textShadow: isHovered ? "0 0 10px rgba(0,255,65,0.3)" : "none",
                    }),
                transition: "font-size 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {dateNumber}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase" style={{ color: colors.dayName }}>
                {dayName}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: colors.month }}>
                {monthName} <span style={{ color: colors.year }}>{yearStr}</span>
              </span>
            </div>
          </div>

          {/* Right: Today badge or progress */}
          <div className="flex items-center gap-2">
            {isToday && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-[0.2em] uppercase"
                style={{
                  background: "rgba(0,255,65,0.12)",
                  color: "#00ff41",
                  border: "1px solid rgba(0,255,65,0.25)",
                }}
              >
                TODAY
              </motion.span>
            )}
            {totalCount > 0 && (
              <span className="text-[9px] font-mono font-bold" style={{ color: colors.progressCount }}>
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar - thin, below header */}
        {totalCount > 0 && (
          <div className="px-3 sm:px-4 pt-1.5">
            <div className="h-[2px] rounded-full overflow-hidden" style={{ background: colors.progressTrack }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  background: progress === 1
                    ? "linear-gradient(90deg, #00ff41, #00dd38)"
                    : "linear-gradient(90deg, #00ff41, #00aa2a)",
                  boxShadow: progress === 1
                    ? "0 0 8px rgba(0,255,65,0.4)"
                    : "0 0 3px rgba(0,255,65,0.15)",
                }}
              />
            </div>
          </div>
        )}

        {/* Body - Todo list */}
        <div
          data-todo-list
          className="flex-1 px-3 py-2 overflow-y-auto"
          style={{
            maxHeight: active ? (isMobile ? 250 : 340) : (isMobile ? 100 : 140),
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,255,65,0.2) transparent",
            transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <AnimatePresence initial={false}>
            {todos.map((todo, i) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, todo)}
                className="group/todo flex items-start gap-2.5 py-2 last:border-0"
                style={{
                  borderBottom: `1px solid ${colors.todoBorder}`,
                  cursor: "grab",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleTodo(date, todo.id); }}
                  className="flex-shrink-0 mt-[2px] w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    borderColor: todo.completed ? "#00ff41" : colors.checkBorder,
                    backgroundColor: todo.completed ? "rgba(0,255,65,0.2)" : "transparent",
                    boxShadow: todo.completed ? "0 0 8px rgba(0,255,65,0.25)" : "none",
                  }}
                >
                  <AnimatePresence>
                    {todo.completed && (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Check size={10} color="#00ff41" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Todo text or edit input */}
                {editingTodoId === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={commitEdit}
                    className="todo-edit-input flex-1"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 text-[12px] sm:text-[13px] font-mono font-medium leading-relaxed break-words transition-all duration-300"
                    style={{
                      color: todo.completed ? colors.todoCompleted : colors.todoText,
                      textDecoration: todo.completed ? "line-through" : "none",
                      textDecorationColor: todo.completed ? "rgba(0,255,65,0.4)" : undefined,
                      opacity: todo.completed ? 0.7 : 1,
                      letterSpacing: "0.02em",
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); startEdit(todo); }}
                  >
                    {todo.text}
                  </span>
                )}

                {/* Edit + Delete buttons */}
                <div className="flex-shrink-0 flex items-center gap-0.5 mt-[2px]">
                  {editingTodoId !== todo.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(todo); }}
                      className="opacity-0 group-hover/todo:opacity-50 hover:!opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-[rgba(0,255,65,0.12)] active:scale-90"
                    >
                      <Pencil size={11} color="#00ff41" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteTodo(date, todo.id); }}
                    className="flex-shrink-0 opacity-0 group-hover/todo:opacity-50 hover:!opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-[rgba(255,68,68,0.15)] active:scale-90"
                  >
                    <X size={12} color="#ff6666" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && !isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center h-full py-8"
            >
              <Calendar size={20} style={{ color: colors.emptyIcon }} />
              <span className="text-[11px] font-mono font-bold mt-2 tracking-widest uppercase" style={{ color: colors.emptyText }}>
                {isPast ? "NO TASKS" : "EMPTY QUEUE"}<span style={{ animation: "blink 1s step-end infinite" }}>_</span>
              </span>
            </motion.div>
          )}

          {isDragOver && todos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-8"
            >
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase" style={{ color: "#00ff41" }}>
                DROP HERE
              </span>
            </motion.div>
          )}
        </div>

        {/* Footer - Add todo */}
        <div className="px-3 pb-3 pt-1.5" style={{ borderTop: `1px solid ${colors.footerBorder}` }}>
          <AnimatePresence mode="wait">
            {inputVisible ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-[13px] font-mono font-black" style={{ color: colors.prompt, animation: "blink 1s step-end infinite" }}>
                  {">"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setTimeout(() => inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
                  }}
                  onBlur={() => {
                    if (!inputValue && !isToday) setInputVisible(false);
                  }}
                  placeholder="add task..."
                  className="flex-1 bg-transparent text-[16px] sm:text-[13px] font-mono font-medium outline-none"
                  style={{
                    color: "#00ff41",
                    caretColor: "#00ff41",
                    borderBottom: `1px solid ${colors.inputBorder}`,
                    paddingBottom: 4,
                  }}
                  autoFocus={!isToday}
                />
                <button
                  onClick={handleAdd}
                  className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(0,255,65,0.12)] hover:shadow-[0_0_10px_rgba(0,255,65,0.2)] active:scale-90"
                >
                  <Plus size={14} color="#00ff41" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); showInput(); }}
                className="flex items-center gap-1.5 w-full justify-center py-2 rounded-lg transition-all duration-200 hover:bg-[rgba(0,255,65,0.08)]"
              >
                <Plus size={12} style={{ color: colors.addBtn }} />
                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase" style={{ color: colors.addBtn }}>
                  ADD TASK
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default DateCard;
