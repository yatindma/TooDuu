"use client";

export default function TimelineConnector() {
  return (
    <div
      className="fixed left-0 right-0 z-10 pointer-events-none hidden sm:block"
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
  );
}
