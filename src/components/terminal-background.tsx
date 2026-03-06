"use client";

import React from "react";

// ============================================================
// PARALLAX TERMINAL BACKGROUND
// 5 independent SVG layers stacked on top of each other.
// Each layer has a different translateX speed multiplier
// driven by a CSS custom property --scroll-x set via JS.
// This creates the 3D depth illusion on horizontal scroll.
// ============================================================

const PARTICLE_COUNT = 40;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.3 + 0.08,
  duration: Math.random() * 25 + 15,
  delay: Math.random() * -20,
  driftX: Math.random() * 50 - 25,
  driftY: Math.random() * 40 - 20,
}));

// Small star-like dots for the deep space layer
const stars = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 3000,
  y: Math.random() * 100,
  r: Math.random() * 1.2 + 0.3,
  opacity: Math.random() * 0.5 + 0.1,
}));

const TerminalBackground = React.memo(function TerminalBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Keyframes for all layers */}
      <style>{`
        @keyframes tb-particle-drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(calc(var(--dx) * 0.5), calc(var(--dy) * -0.3)); }
          50% { transform: translate(var(--dx), var(--dy)); }
          75% { transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.7)); }
        }
        @keyframes tb-horizon-pulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.28; }
        }
        @keyframes tb-grid-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes tb-star-twinkle {
          0%, 100% { opacity: var(--star-o); }
          50% { opacity: calc(var(--star-o) * 0.3); }
        }
        @keyframes tb-nebula-drift {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(-30px) scale(1.05); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes tb-ring-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .parallax-layer {
          position: absolute;
          inset: 0;
          will-change: transform;
          transition: transform 0.05s linear;
        }
      `}</style>

      {/* =============================================
          LAYER 1 (deepest) - Star field
          Speed: 0.05x (barely moves)
          ============================================= */}
      <div
        className="parallax-layer"
        data-parallax-speed="0.05"
        style={{ zIndex: 1 }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 3000 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {stars.map((s) => (
            <circle
              key={s.id}
              cx={s.x}
              cy={s.y * 10}
              r={s.r}
              fill="#00ff41"
              opacity={s.opacity}
              style={{
                // @ts-expect-error CSS custom properties
                "--star-o": s.opacity,
                animation: `tb-star-twinkle ${3 + Math.random() * 5}s ease-in-out ${Math.random() * -5}s infinite`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* =============================================
          LAYER 2 - Nebula/fog clouds
          Speed: 0.1x
          ============================================= */}
      <div
        className="parallax-layer"
        data-parallax-speed="0.1"
        style={{ zIndex: 2 }}
      >
        {/* Nebula blob 1 */}
        <div
          className="absolute"
          style={{
            left: "15%",
            top: "20%",
            width: "500px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(0,255,65,0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "tb-nebula-drift 30s ease-in-out infinite",
          }}
        />
        {/* Nebula blob 2 */}
        <div
          className="absolute"
          style={{
            right: "10%",
            top: "40%",
            width: "400px",
            height: "250px",
            background: "radial-gradient(ellipse, rgba(0,212,255,0.03) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "tb-nebula-drift 25s ease-in-out 5s infinite",
          }}
        />
        {/* Nebula blob 3 */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "60%",
            width: "600px",
            height: "200px",
            background: "radial-gradient(ellipse, rgba(0,255,65,0.025) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(70px)",
            animation: "tb-nebula-drift 35s ease-in-out 10s infinite",
          }}
        />
      </div>

      {/* =============================================
          LAYER 3 - Grid floor (perspective)
          Speed: 0.2x
          ============================================= */}
      <div
        className="parallax-layer"
        data-parallax-speed="0.2"
        style={{ zIndex: 3 }}
      >
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: "45%",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%)",
            perspective: "400px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "center bottom",
              transform: "rotateX(65deg)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "200%",
                animation: "tb-grid-scroll 4s linear infinite",
              }}
            >
              <svg
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                viewBox="0 0 1000 500"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Horizontal grid lines */}
                {Array.from({ length: 25 }, (_, i) => {
                  const y = i * 22;
                  const opacity = 0.04 + (i / 25) * 0.1;
                  return (
                    <line
                      key={`h-${i}`}
                      x1="0" y1={y} x2="1000" y2={y}
                      stroke="#00ff41"
                      strokeWidth={0.6}
                      opacity={opacity}
                    />
                  );
                })}
                {/* Vertical grid lines */}
                {Array.from({ length: 30 }, (_, i) => {
                  const x = (i / 29) * 1000;
                  return (
                    <line
                      key={`v-${i}`}
                      x1={x} y1="0" x2={x} y2="500"
                      stroke="#00ff41"
                      strokeWidth={0.5}
                      opacity={0.06}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================
          LAYER 4 - Floating particles
          Speed: 0.35x
          ============================================= */}
      <div
        className="parallax-layer"
        data-parallax-speed="0.35"
        style={{ zIndex: 4 }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: "#00ff41",
              opacity: p.opacity,
              // @ts-expect-error CSS custom properties
              "--dx": `${p.driftX}px`,
              "--dy": `${p.driftY}px`,
              animation: `tb-particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* =============================================
          LAYER 5 (closest) - HUD elements + horizon
          Speed: 0.5x
          ============================================= */}
      <div
        className="parallax-layer"
        data-parallax-speed="0.5"
        style={{ zIndex: 5 }}
      >
        {/* Horizon glow line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "55%",
            height: "2px",
            background: "linear-gradient(90deg, transparent 5%, #00ff41 30%, #00ff41 70%, transparent 95%)",
            boxShadow: "0 0 40px 12px rgba(0,255,65,0.08)",
            opacity: 0.15,
            animation: "tb-horizon-pulse 6s ease-in-out infinite",
          }}
        />

        {/* Decorative rotating ring - top right */}
        <svg
          className="absolute"
          style={{ top: "10%", right: "8%", opacity: 0.06 }}
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="60" cy="60" r="50"
            stroke="#00ff41"
            strokeWidth="0.5"
            strokeDasharray="8 4"
            style={{ animation: "tb-ring-rotate 40s linear infinite" }}
            transform-origin="60 60"
          />
          <circle
            cx="60" cy="60" r="35"
            stroke="#00ff41"
            strokeWidth="0.3"
            strokeDasharray="4 8"
            style={{ animation: "tb-ring-rotate 25s linear reverse infinite" }}
            transform-origin="60 60"
          />
        </svg>

        {/* Decorative rotating ring - bottom left */}
        <svg
          className="absolute"
          style={{ bottom: "15%", left: "5%", opacity: 0.05 }}
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="40" cy="40" r="30"
            stroke="#00d4ff"
            strokeWidth="0.4"
            strokeDasharray="6 3"
            style={{ animation: "tb-ring-rotate 30s linear infinite" }}
            transform-origin="40 40"
          />
        </svg>
      </div>

      {/* Corner HUD brackets (fixed, no parallax) */}
      {/* Top-left */}
      <svg className="absolute top-4 left-4" width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity: 0.2, zIndex: 6 }}>
        <path d="M0 10 L0 0 L10 0" stroke="#00ff41" strokeWidth="1.2" />
        <path d="M0 5 L5 5 L5 0" stroke="#00ff41" strokeWidth="0.6" opacity="0.5" />
      </svg>
      {/* Top-right */}
      <svg className="absolute top-4 right-4" width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity: 0.2, zIndex: 6 }}>
        <path d="M36 10 L36 0 L26 0" stroke="#00ff41" strokeWidth="1.2" />
        <path d="M36 5 L31 5 L31 0" stroke="#00ff41" strokeWidth="0.6" opacity="0.5" />
      </svg>
      {/* Bottom-left */}
      <svg className="absolute bottom-4 left-4" width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity: 0.2, zIndex: 6 }}>
        <path d="M0 26 L0 36 L10 36" stroke="#00ff41" strokeWidth="1.2" />
        <path d="M0 31 L5 31 L5 36" stroke="#00ff41" strokeWidth="0.6" opacity="0.5" />
      </svg>
      {/* Bottom-right */}
      <svg className="absolute bottom-4 right-4" width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity: 0.2, zIndex: 6 }}>
        <path d="M36 26 L36 36 L26 36" stroke="#00ff41" strokeWidth="1.2" />
        <path d="M36 31 L31 31 L31 36" stroke="#00ff41" strokeWidth="0.6" opacity="0.5" />
      </svg>

      {/* Vignette overlay (topmost) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
          zIndex: 7,
        }}
      />
    </div>
  );
});

export default TerminalBackground;
