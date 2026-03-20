"use client";

import { useEffect, useState, useCallback } from "react";
import TerminalBackground from "@/components/terminal-background";
import DateCard from "@/components/date-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TimelineConnector from "@/components/timeline-connector";
import MobileTodayButton from "@/components/mobile-today-button";
import AuthModal from "@/components/auth-modal";
import MigrateModal from "@/components/migrate-modal";
import useTodos from "@/hooks/use-todos";
import { useClock } from "@/hooks/use-clock";
import { useTimelineScroll } from "@/hooks/use-timeline-scroll";
import { useAuth } from "@/lib/auth-context";
import { formatDate, addDays, getToday, getSelectedLabel } from "@/lib/date-utils";
import packageJson from "../../package.json";

const FUTURE_DAYS = 15;
const INITIAL_PAST_DAYS = 30;
const LOAD_MORE_PAST_DAYS = 30;

/** Collect all localStorage keys starting with "todos-" */
function getLocalTodoKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("todos-")) keys.push(key);
  }
  return keys;
}

/** Count total local todos across all dates */
function countLocalTodos(): number {
  return getLocalTodoKeys().reduce((sum, key) => {
    try {
      return sum + JSON.parse(localStorage.getItem(key) || "[]").length;
    } catch {
      return sum;
    }
  }, 0);
}

/** Remove all local todo entries */
function clearLocalTodos(): void {
  getLocalTodoKeys().forEach((k) => localStorage.removeItem(k));
}

export default function Home() {
  const today = getToday();
  const todayStr = formatDate(today);

  const [pastDaysCount, setPastDaysCount] = useState(INITIAL_PAST_DAYS);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [showMigrate, setShowMigrate] = useState(false);

  const { user, logout, loading: authLoading, justAuthenticated, clearJustAuthenticated } = useAuth();
  const { getTodosForDate, addTodo, toggleTodo, deleteTodo, moveTodo, editTodo, loadDateRange, clearTodos } = useTodos();
  const time = useClock();

  // Generate date range
  const startDate = addDays(today, -pastDaysCount);
  const endDate = addDays(today, FUTURE_DAYS);
  const dates: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
    dates.push(formatDate(d));
  }

  const handleLoadMorePast = useCallback(() => {
    setPastDaysCount((prev) => prev + LOAD_MORE_PAST_DAYS);
  }, []);

  const { scrollRef, cardRefs, scrollToDate, scrollByDir } = useTimelineScroll({
    mounted,
    selectedDate,
    dates,
    onSelectDate: setSelectedDate,
    onLoadMorePast: handleLoadMorePast,
  });

  const handleLogout = async () => {
    await logout();
    clearTodos();
    const start = addDays(today, -pastDaysCount);
    const end = addDays(today, FUTURE_DAYS);
    setTimeout(() => loadDateRange(formatDate(start), formatDate(end)), 100);
  };

  // Check for local todos on active login/register
  useEffect(() => {
    if (!user || authLoading || !justAuthenticated) return;
    if (countLocalTodos() > 0) setShowMigrate(true);
    clearJustAuthenticated();
  }, [user, authLoading, justAuthenticated, clearJustAuthenticated]);

  const handleMigrate = async () => {
    const existingRes = await fetch("/api/todos").catch(() => null);
    const existingData = existingRes ? await existingRes.json().catch(() => ({ todos: [] })) : { todos: [] };
    const existingSet = new Set(
      (existingData.todos || []).map((t: { text: string; date: string }) => `${t.date}::${t.text}`)
    );

    for (const key of getLocalTodoKeys()) {
      const date = key.replace("todos-", "");
      try {
        const todos = JSON.parse(localStorage.getItem(key) || "[]");
        for (const todo of todos) {
          const dedupeKey = `${date}::${todo.text}`;
          if (existingSet.has(dedupeKey)) continue;
          existingSet.add(dedupeKey);
          await fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: todo.text, date }),
          });
        }
      } catch { /* skip */ }
    }
    clearLocalTodos();
    setShowMigrate(false);
    loadDateRange(formatDate(addDays(today, -pastDaysCount)), formatDate(addDays(today, FUTURE_DAYS)));
  };

  const handleSkipMigrate = () => {
    clearLocalTodos();
    setShowMigrate(false);
  };

  // Load todos for visible range
  useEffect(() => {
    loadDateRange(formatDate(startDate), formatDate(endDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastDaysCount, user]);

  // Scroll to today on mount
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => scrollToDate(todayStr, "auto"), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToToday = () => {
    setSelectedDate(todayStr);
    scrollToDate(todayStr);
  };

  const handleCardSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    requestAnimationFrame(() => scrollToDate(dateStr));
  };

  // Stats
  const todayTodos = getTodosForDate(todayStr);
  const completedToday = todayTodos.filter((t) => t.completed).length;
  const totalToday = todayTodos.length;
  const selectedLabel = getSelectedLabel(selectedDate, todayStr, today);

  if (!mounted) return null;

  return (
    <div className="terminal-container">
      <TerminalBackground />

      <Header
        version={packageJson.version}
        completedToday={completedToday}
        totalToday={totalToday}
        time={time}
        user={user}
        onScrollLeft={() => scrollByDir("left")}
        onScrollRight={() => scrollByDir("right")}
        onScrollToToday={scrollToToday}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthModal("login")}
        onOpenRegister={() => setAuthModal("register")}
      />

      <TimelineConnector />
      <MobileTodayButton onScrollToToday={scrollToToday} />

      {/* Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="fixed inset-0 z-20 overflow-x-auto overflow-y-hidden flex items-center momentum-scroll"
        style={{ paddingTop: "50px", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        <div
          className="flex items-center gap-6 sm:gap-10"
          style={{ paddingLeft: "calc(50vw - 90px)", paddingRight: "calc(50vw - 90px)" }}
        >
          {dates.map((dateStr, index) => (
            <div
              key={dateStr}
              ref={(el) => { cardRefs.current[dateStr] = el; }}
              className="date-card cursor-pointer"
              onClick={() => handleCardSelect(dateStr)}
            >
              <DateCard
                date={dateStr}
                todos={getTodosForDate(dateStr)}
                isToday={dateStr === todayStr}
                isPast={dateStr < todayStr}
                isSelected={dateStr === selectedDate}
                index={index}
                onAddTodo={addTodo}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
                onMoveTodo={moveTodo}
                onEditTodo={editTodo}
              />
            </div>
          ))}
        </div>
      </div>

      <Footer selectedLabel={selectedLabel} />

      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        initialMode={authModal || "login"}
      />

      <MigrateModal
        isOpen={showMigrate}
        onMigrate={handleMigrate}
        onSkip={handleSkipMigrate}
        localCount={countLocalTodos()}
      />
    </div>
  );
}
