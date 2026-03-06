"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Plus, X, Check, Calendar, Sparkles } from "lucide-react";
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
}: DateCardProps) {
  const [inputVisible, setInputVisible] = useState(isToday);
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const cardWidth = isSelected ? 300 : 230;
  const cardMinHeight = isSelected ? 360 : 260;
  const active = isSelected;

  // Color scheme - HIGH READABILITY
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
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: active ? -16 : 0,
        scale: active ? 1.02 : 1,
      }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.03, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex-shrink-0 flex flex-col rounded-2xl transition-all duration-500 group"
      style={{
        width: cardWidth,
        minHeight: cardMinHeight,
      }}
    >
      {/* === Animated glowing border for selected/today === */}
      {active && (
        <>
          {/* Outer glow aura */}
          <div
            className="absolute -inset-[2px] rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,212,255,0.1), rgba(0,255,65,0.3))",
              filter: "blur(4px)",
              opacity: 0.6,
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />
          {/* Animated border gradient */}
          <div
            className="absolute -inset-[1px] rounded-2xl pointer-events-none overflow-hidden"
            style={{
              background: "linear-gradient(var(--glow-angle, 0deg), #00ff41, rgba(0,212,255,0.6), #00ff41, rgba(0,255,65,0.3))",
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
      {!active && (
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

      {/* === Top glow aura for active cards === */}
      {active && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[250%] h-28 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,255,65,0.12) 0%, transparent 65%)",
            filter: "blur(25px)",
            mixBlendMode: "screen",
            zIndex: 0,
          }}
        />
      )}

      {/* === Card background === */}
      <div
        className="absolute inset-[1px] rounded-2xl overflow-hidden"
        style={{
          background: active
            ? "linear-gradient(180deg, rgba(0,255,65,0.05) 0%, #0a0e10 20%, #0a0c0f 100%)"
            : isPast
            ? "#090b0e"
            : "#0b0d12",
        }}
      />

      {/* === CONTENT === */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div
          className="flex flex-col items-center gap-1 px-4 pt-4 pb-3"
          style={{ borderBottom: `1px solid ${colors.headerBorder}` }}
        >
          {/* Day name */}
          <span
            className="text-[11px] font-mono tracking-[0.25em] font-bold uppercase transition-colors duration-300"
            style={{ color: colors.dayName }}
          >
            {dayName}
          </span>

          {/* Date number */}
          <div className="flex items-center gap-2">
            {isToday && (
              <motion.span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: "#00ff41",
                  boxShadow: "0 0 8px #00ff41, 0 0 20px rgba(0,255,65,0.4)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span
              className="text-6xl font-mono font-black leading-none tracking-tight"
              style={{
                ...(active
                  ? {
                      background: "linear-gradient(180deg, #00ff41 0%, #00dd38 60%, #00aa2a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 15px rgba(0,255,65,0.5))",
                    }
                  : {
                      color: colors.dateNum,
                      textShadow: isHovered ? "0 0 10px rgba(0,255,65,0.3)" : "none",
                    }),
              }}
            >
              {dateNumber}
            </span>
          </div>

          {/* Month + Year */}
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] transition-colors duration-300"
              style={{ color: colors.month }}
            >
              {monthName}
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: colors.year }}>
              {yearStr}
            </span>
          </div>

          {/* TODAY badge */}
          {isToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.3em] uppercase"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,65,0.18) 0%, rgba(0,255,65,0.06) 100%)",
                color: "#00ff41",
                border: "1px solid rgba(0,255,65,0.3)",
                boxShadow: "0 0 15px rgba(0,255,65,0.12), inset 0 0 8px rgba(0,255,65,0.05)",
              }}
            >
              <Sparkles size={9} />
              TODAY
            </motion.div>
          )}

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="w-full mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: colors.progressTrack }}>
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
                      ? "0 0 10px rgba(0,255,65,0.5)"
                      : "0 0 4px rgba(0,255,65,0.2)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold" style={{ color: colors.progressCount }}>
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {/* Body - Todo list */}
        <div
          data-todo-list
          className="flex-1 px-3 py-2 overflow-y-auto"
          style={{
            maxHeight: active ? 190 : 130,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,255,65,0.2) transparent",
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
                className="group/todo flex items-start gap-2.5 py-2 last:border-0"
                style={{ borderBottom: `1px solid ${colors.todoBorder}` }}
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

                {/* Todo text - MAX VISIBILITY */}
                <span
                  className="flex-1 text-[13px] font-mono font-medium leading-relaxed break-words transition-all duration-300"
                  style={{
                    color: todo.completed ? colors.todoCompleted : colors.todoText,
                    textDecoration: todo.completed ? "line-through" : "none",
                    textDecorationColor: todo.completed ? "rgba(0,255,65,0.4)" : undefined,
                    opacity: todo.completed ? 0.7 : 1,
                    letterSpacing: "0.02em",
                  }}
                >
                  {todo.text}
                </span>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTodo(date, todo.id); }}
                  className="flex-shrink-0 mt-[2px] opacity-50 hover:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-[rgba(255,68,68,0.15)] active:scale-90"
                >
                  <X size={12} color="#ff6666" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && (
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
                <span className="text-[13px] font-mono font-black" style={{ color: colors.prompt, animation: "neon-breathe 2s ease-in-out infinite" }}>
                  {">"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!inputValue && !isToday) setInputVisible(false);
                  }}
                  placeholder="add task..."
                  className="flex-1 bg-transparent text-[13px] font-mono font-medium outline-none"
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
