"use client";

import { useRef, useCallback, useEffect } from "react";

interface UseTimelineScrollOptions {
  mounted: boolean;
  selectedDate: string;
  dates: string[];
  onSelectDate: (date: string) => void;
  onLoadMorePast: () => void;
}

export function useTimelineScroll({
  mounted,
  selectedDate,
  dates,
  onSelectDate,
  onLoadMorePast,
}: UseTimelineScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const velocityRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const autoSelectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cache parallax layers
  const parallaxLayersRef = useRef<{ el: HTMLElement; speed: number }[]>([]);
  useEffect(() => {
    const bgEl = document.querySelector(".fixed.inset-0.overflow-hidden.pointer-events-none");
    if (bgEl) {
      parallaxLayersRef.current = Array.from(
        bgEl.querySelectorAll<HTMLElement>("[data-parallax-speed]")
      ).map((el) => ({
        el,
        speed: parseFloat(el.dataset.parallaxSpeed || "0"),
      }));
    }
  }, [mounted]);

  const detectCenterCard = useCallback(() => {
    if (isAnimatingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    let closestDate = "";
    let closestDist = Infinity;
    for (const [dateStr, el] of Object.entries(cardRefs.current)) {
      if (!el) continue;
      const cardCenter = el.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestDate = dateStr;
      }
    }
    if (closestDate && closestDate !== selectedDate) {
      onSelectDate(closestDate);
    }
  }, [selectedDate, onSelectDate]);

  const detectCenterCardRef = useRef(detectCenterCard);
  detectCenterCardRef.current = detectCenterCard;

  // Momentum animation
  const animateScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollLeft += velocityRef.current;
    velocityRef.current *= 0.88;

    if (Math.abs(velocityRef.current) > 0.3) {
      requestAnimationFrame(animateScroll);
    } else {
      velocityRef.current = 0;
      isAnimatingRef.current = false;
      if (autoSelectTimerRef.current) clearTimeout(autoSelectTimerRef.current);
      autoSelectTimerRef.current = setTimeout(() => detectCenterCardRef.current(), 100);
    }
  }, []);

  // Wheel → horizontal scroll
  useEffect(() => {
    if (!mounted) return;
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-todo-list]")) return;

      e.preventDefault();

      const isTrackpad = Math.abs(e.deltaY) < 50 && !Number.isInteger(e.deltaY);
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      if (isTrackpad) {
        container.scrollLeft += delta;
      } else {
        velocityRef.current += delta * 0.3;
        velocityRef.current = Math.max(-40, Math.min(40, velocityRef.current));
        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true;
          requestAnimationFrame(animateScroll);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [mounted, animateScroll]);

  // Scroll handler: parallax + infinite past + auto-select
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;

    const centerOffset = (scrollPercent - 0.5) * 2;
    for (const { el, speed } of parallaxLayersRef.current) {
      el.style.transform = `translateX(${centerOffset * speed * -200}px)`;
    }

    if (scrollLeft < 400) {
      onLoadMorePast();
    }

    if (autoSelectTimerRef.current) clearTimeout(autoSelectTimerRef.current);
    autoSelectTimerRef.current = setTimeout(detectCenterCard, 400);
  }, [detectCenterCard, onLoadMorePast]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToDate = useCallback(
    (dateStr: string, behavior: ScrollBehavior = "smooth") => {
      const card = cardRefs.current[dateStr];
      const container = scrollRef.current;
      if (card && container) {
        const scrollLeft = card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior });
      }
    },
    []
  );

  const scrollByDir = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 640;
    const amount = direction === "left" ? (isMobile ? -200 : -300) : isMobile ? 200 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        const idx = dates.indexOf(selectedDate);
        if (idx > 0) {
          onSelectDate(dates[idx - 1]);
          scrollToDate(dates[idx - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const idx = dates.indexOf(selectedDate);
        if (idx < dates.length - 1) {
          onSelectDate(dates[idx + 1]);
          scrollToDate(dates[idx + 1]);
        }
      } else if (e.key === "Home" || e.key === "t") {
        onSelectDate(dates.find((d) => d === selectedDate) ? selectedDate : dates[0]);
        // scrollToToday handled at parent level
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedDate, dates, onSelectDate, scrollToDate]);

  return {
    scrollRef,
    cardRefs,
    scrollToDate,
    scrollByDir,
  };
}
