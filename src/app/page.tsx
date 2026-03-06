"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Terminal, Zap, LogIn, UserPlus, LogOut, User } from "lucide-react";
import TerminalBackground from "@/components/terminal-background";
import DateCard from "@/components/date-card";
import AuthModal from "@/components/auth-modal";
import MigrateModal from "@/components/migrate-modal";
import useTodos from "@/hooks/use-todos";
import { useAuth } from "@/lib/auth-context";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const FUTURE_DAYS = 15;
const INITIAL_PAST_DAYS = 30;
const LOAD_MORE_PAST_DAYS = 30;

export default function Home() {
  const today = getToday();
  const todayStr = formatDate(today);

  const [pastDaysCount, setPastDaysCount] = useState(INITIAL_PAST_DAYS);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [showMigrate, setShowMigrate] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { user, logout, loading: authLoading } = useAuth();
  const { getTodosForDate, addTodo, toggleTodo, deleteTodo, loadDateRange } = useTodos();

  // Check for local todos when user logs in - offer migration
  useEffect(() => {
    if (!user || authLoading) return;
    // Count local todos across all localStorage keys
    let localCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("todos-")) {
        try {
          const arr = JSON.parse(localStorage.getItem(key) || "[]");
          localCount += arr.length;
        } catch { /* skip */ }
      }
    }
    if (localCount > 0) {
      setShowMigrate(true);
    }
  }, [user, authLoading]);

  const handleMigrate = async () => {
    // Move all localStorage todos to the DB
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("todos-")) {
        const date = key.replace("todos-", "");
        try {
          const todos = JSON.parse(localStorage.getItem(key) || "[]");
          for (const todo of todos) {
            await fetch("/api/todos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: todo.text, date }),
            });
          }
        } catch { /* skip */ }
      }
    }
    // Clear local todos
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("todos-")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setShowMigrate(false);
    // Reload todos from DB
    const startDate = addDays(today, -pastDaysCount);
    const endDate = addDays(today, FUTURE_DAYS);
    loadDateRange(formatDate(startDate), formatDate(endDate));
  };

  const handleSkipMigrate = () => {
    // Clear local todos, start fresh with DB
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("todos-")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setShowMigrate(false);
  };

  const getLocalTodoCount = () => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("todos-")) {
        try { count += JSON.parse(localStorage.getItem(key) || "[]").length; } catch { /* skip */ }
      }
    }
    return count;
  };

  // Generate date range
  const startDate = addDays(today, -pastDaysCount);
  const endDate = addDays(today, FUTURE_DAYS);
  const dates: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
    dates.push(formatDate(d));
  }

  // Load todos for visible range
  useEffect(() => {
    loadDateRange(formatDate(startDate), formatDate(endDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastDaysCount]);

  // Scroll to today on mount
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      scrollToDate(todayStr, "auto");
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse wheel (up/down) → horizontal scroll, BUT if hovering over
  // a scrollable todo list inside a card, let it scroll vertically
  useEffect(() => {
    if (!mounted) return;
    const container = scrollRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Walk up from target to find a scrollable todo list container
      const scrollableParent = target.closest("[data-todo-list]") as HTMLElement | null;
      if (scrollableParent) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
        const atTop = scrollTop <= 0 && e.deltaY < 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
        // If the list can still scroll in the wheel direction, let it scroll vertically
        if (!atTop && !atBottom) {
          // Don't prevent default - let the list scroll naturally
          e.stopPropagation();
          return;
        }
      }
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      container.scrollLeft += delta * 2;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [mounted]);

  // Parallax + infinite past loading on scroll
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    // Move parallax layers
    const bgEl = document.querySelector(".fixed.inset-0.overflow-hidden.pointer-events-none") as HTMLElement;
    if (bgEl) {
      const layers = bgEl.querySelectorAll<HTMLElement>("[data-parallax-speed]");
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallaxSpeed || "0");
        const centerOffset = (scrollPercent - 0.5) * 2;
        const translateX = centerOffset * speed * -200;
        layer.style.transform = `translateX(${translateX}px)`;
      });
    }

    // Infinite past: load more when near left edge
    if (scrollLeft < 400) {
      setPastDaysCount((prev) => prev + LOAD_MORE_PAST_DAYS);
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll to a specific date
  const scrollToDate = (dateStr: string, behavior: ScrollBehavior = "smooth") => {
    const card = cardRefs.current[dateStr];
    const container = scrollRef.current;
    if (card && container) {
      const scrollLeft = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior });
    }
  };

  const scrollToToday = () => {
    setSelectedDate(todayStr);
    scrollToDate(todayStr);
  };

  const handleCardSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    scrollToDate(dateStr);
  };

  const scrollByDir = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        const idx = dates.indexOf(selectedDate);
        if (idx > 0) {
          setSelectedDate(dates[idx - 1]);
          scrollToDate(dates[idx - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const idx = dates.indexOf(selectedDate);
        if (idx < dates.length - 1) {
          setSelectedDate(dates[idx + 1]);
          scrollToDate(dates[idx + 1]);
        }
      } else if (e.key === "Home" || e.key === "t") {
        scrollToToday();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, dates]);

  // Current time
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const todayTodos = getTodosForDate(todayStr);
  const completedToday = todayTodos.filter((t) => t.completed).length;
  const totalToday = todayTodos.length;

  // Selected date info for bottom bar
  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const selectedLabel = selectedDate === todayStr
    ? "TODAY"
    : selectedDateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();

  if (!mounted) return null;

  return (
    <div className="terminal-container">
      <TerminalBackground />

      {/* ========== TOP BAR ========== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: "linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#00ff41]" />
          <span
            className="font-mono text-sm font-bold tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #00ff41 0%, #00cc33 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(0,255,65,0.3))",
            }}
          >
            TOODUU<span style={{ animation: "blink 1s step-end infinite", WebkitTextFillColor: "#00ff41" }}>_</span>
          </span>
          <span className="font-mono text-[10px] text-[#00ff41]/20 ml-1" style={{ animation: "blink 1.2s step-end infinite" }}>v2.0</span>
        </div>

        {/* Stats bar */}
        <div className="stats-bar hidden sm:flex" style={{ color: "rgba(0,255,65,0.7)" }}>
          <div className="stat-item">
            <div className={`stat-dot ${totalToday === 0 ? "amber" : completedToday === totalToday && totalToday > 0 ? "" : "amber"}`} />
            <span>{completedToday}/{totalToday} tasks</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot" />
            <span style={{ animation: "blink 2s step-end infinite" }}>SYS:ONLINE</span>
          </div>
          <div className="stat-item">
            <Zap size={10} className="text-[#00ff41]" />
            <span>{time}</span>
          </div>
        </div>

        {/* Nav + Auth */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByDir("left")}
            className="p-2 rounded-lg transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-90"
          >
            <ChevronLeft size={18} className="text-[#00ff41]/50" />
          </button>
          <button
            onClick={scrollToToday}
            className="px-3 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all hover:bg-[rgba(0,255,65,0.1)] active:scale-95"
            style={{
              color: "#00ff41",
              border: "1px solid rgba(0,255,65,0.2)",
              boxShadow: "0 0 12px rgba(0,255,65,0.06)",
            }}
          >
            TODAY
          </button>
          <button
            onClick={() => scrollByDir("right")}
            className="p-2 rounded-lg transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-90"
          >
            <ChevronRight size={18} className="text-[#00ff41]/50" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 mx-1" style={{ background: "rgba(0,255,65,0.15)" }} />

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "rgba(0,255,65,0.06)" }}>
                <User size={13} color="#00ff41" />
                <span className="text-[10px] font-mono font-bold text-[#00ff41] max-w-[80px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg transition-all hover:bg-[rgba(255,68,68,0.1)] active:scale-90"
                title="Logout"
              >
                <LogOut size={15} color="#ff6666" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAuthModal("login")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[rgba(0,255,65,0.08)] active:scale-95"
                style={{ color: "#00ff41" }}
              >
                <LogIn size={13} />
                LOGIN
              </button>
              <button
                onClick={() => setAuthModal("register")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                style={{
                  color: "#00ff41",
                  background: "rgba(0,255,65,0.1)",
                  border: "1px solid rgba(0,255,65,0.2)",
                }}
              >
                <UserPlus size={13} />
                SIGNUP
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* ========== TIMELINE CONNECTOR LINE ========== */}
      <div
        className="fixed left-0 right-0 z-10 pointer-events-none"
        style={{ top: "50%", transform: "translateY(30px)" }}
      >
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.12) 15%, rgba(0,255,65,0.12) 85%, transparent 100%)",
          }}
        />
        {[10, 25, 50, 75, 90].map((pos, i) => (
          <div
            key={pos}
            className="absolute rounded-full"
            style={{
              left: `${pos}%`,
              top: "-2px",
              width: "5px",
              height: "5px",
              background: "#00ff41",
              opacity: 0.3,
              boxShadow: "0 0 8px #00ff41",
              animation: `blink ${1.5 + i * 0.3}s step-end infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ========== SCROLLABLE TIMELINE ========== */}
      <div
        ref={scrollRef}
        className="fixed inset-0 z-20 overflow-x-auto overflow-y-hidden flex items-center"
        style={{
          paddingTop: "60px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <div
          className="flex items-center gap-4"
          style={{
            paddingLeft: "calc(50vw - 150px)",
            paddingRight: "calc(50vw - 115px)",
          }}
        >
          {dates.map((dateStr, index) => {
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const todos = getTodosForDate(dateStr);

            return (
              <div
                key={dateStr}
                ref={(el) => { cardRefs.current[dateStr] = el; }}
                className="date-card cursor-pointer"
                onClick={() => handleCardSelect(dateStr)}
              >
                <DateCard
                  date={dateStr}
                  todos={todos}
                  isToday={isToday}
                  isPast={isPast}
                  isSelected={isSelected}
                  index={index}
                  onAddTodo={addTodo}
                  onToggleTodo={toggleTodo}
                  onDeleteTodo={deleteTodo}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== BOTTOM BAR ========== */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)",
        }}
      >
        <div className="font-mono text-[11px] text-[#00ff41]/70 uppercase tracking-widest font-semibold">
          <span style={{ animation: "blink 1.5s step-end infinite" }}>←</span> SCROLL <span style={{ animation: "blink 1.5s step-end infinite", animationDelay: "0.75s" }}>→</span>
        </div>
        <div className="font-mono text-[11px] text-[#00ff41] uppercase tracking-widest font-bold"
          style={{ textShadow: "0 0 8px rgba(0,255,65,0.3)" }}>
          SELECTED: {selectedLabel}<span style={{ animation: "blink 1s step-end infinite", color: "#00ff41" }}>_</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-[#00ff41]/60 uppercase tracking-wider font-medium">
          <span className="hidden sm:inline">PAST:∞</span>
          <span className="hidden sm:inline">FUTURE:15D</span>
          <span>[←→] NAV</span>
        </div>
      </motion.footer>

      {/* Subtle vignette only */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        initialMode={authModal || "login"}
      />

      {/* Migration Modal */}
      <MigrateModal
        isOpen={showMigrate}
        onMigrate={handleMigrate}
        onSkip={handleSkipMigrate}
        localCount={getLocalTodoCount()}
      />
    </div>
  );
}
