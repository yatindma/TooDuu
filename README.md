<div align="center">

# ⚡ TOODUU

### A Retro-Terminal Futuristic Todo Timeline

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-tooduu-00ff41?style=for-the-badge&logo=googlechrome&logoColor=00ff41&labelColor=0a0a0f)](https://tooduu.srv1302879.hstgr.cloud)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-00ff41?style=for-the-badge&labelColor=0a0a0f)](LICENSE)

<br/>

**A beautifully over-engineered todo app that nobody asked for — but everyone deserves.**

Horizontal scrollable timeline · Retro terminal aesthetic · Parallax 3D backgrounds · Local-first with optional auth

<br/>

[🔴 Live Demo](https://tooduu.srv1302879.hstgr.cloud) · [Report Bug](https://github.com/yatindma/TooDuu/issues) · [Request Feature](https://github.com/yatindma/TooDuu/issues)

</div>

---

## 📸 Preview

<div align="center">

<img src="public/screenshots/hero.png" alt="TOODUU - Retro Terminal Todo Timeline" width="100%" />

<br/>
<sub><i>Horizontal timeline with glowing selected card, parallax SVG background, and terminal-style UI</i></sub>

</div>

---

## 🖥️ What is TOODUU?

TOODUU is a **horizontal-scrolling todo timeline** wrapped in a retro-terminal aesthetic. Navigate through past and future dates, add tasks, and watch your productivity unfold across a sci-fi command line interface.

> Think of it as if someone from 2087 traveled back in time and built a todo app using terminal technology.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core
- **Infinite Timeline** — Scroll left for infinite past, 15 days future
- **Smart Scroll** — Mouse wheel → horizontal; vertical inside todo lists
- **Keyboard Nav** — Arrow keys to navigate, `T` for today
- **CRUD** — Add, complete, delete tasks per date
- **Blinking Cursors** — Terminal-style blink effects everywhere

</td>
<td width="50%">

### 🎨 Design
- **5-Layer Parallax** — Stars, nebula, grid, particles, HUD rings
- **Mouse-Following Glow** — Radial light tracks your cursor
- **Animated Borders** — Rotating gradient glow on selected card
- **Neon Typography** — Gradient text with drop-shadow glow
- **Terminal Green** — `#00ff41` on dark `#0a0a0f` background

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Auth System
- **Works Without Login** — localStorage for anonymous users
- **Optional Accounts** — Register/login with email + password
- **Data Migration** — Prompts to move local todos on signup
- **JWT + Cookies** — Secure httpOnly auth tokens
- **Password Toggle** — Show/hide password in auth modal

</td>
<td width="50%">

### 🚀 Technical
- **Next.js 16** — App Router with Turbopack
- **SQLite** — Zero-config, file-based via better-sqlite3
- **Docker Ready** — Multi-stage build, Traefik labels
- **Optimistic Updates** — Instant UI, async API calls
- **WAL Mode** — Better concurrent SQLite access

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

```
Frontend     → Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
Animations   → Framer Motion + CSS keyframes
Icons        → Lucide React
Auth         → JWT (jose) + httpOnly cookies + bcryptjs
Database     → SQLite (better-sqlite3) — zero config, file-based
Deployment   → Docker + Traefik reverse proxy + Let's Encrypt SSL
```

---

## ⚡ Quick Start

### Local Development

```bash
git clone https://github.com/yatindma/TooDuu.git
cd TooDuu
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — that's it. No database setup. SQLite creates itself.

### Docker

```bash
docker compose up -d --build
```

---

## 📐 Architecture

```
┌─────────────────────────────────────────┐
│              Browser                     │
│  localStorage (anonymous)               │
│  OR API calls (authenticated)           │
└──────────────┬──────────────────────────┘
               │
   ┌───────────▼───────────┐
   │   Next.js 16 Server   │
   │                       │
   │  /api/auth/login      │
   │  /api/auth/register   │
   │  /api/auth/me         │
   │  /api/auth/logout     │
   │  /api/todos (CRUD)    │
   │         │             │
   │  ┌──────▼──────┐     │
   │  │   SQLite    │     │
   │  │  (WAL mode) │     │
   │  └─────────────┘     │
   └───────────────────────┘
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/               # login, register, me, logout
│   │   └── todos/              # GET, POST, PATCH, DELETE
│   ├── globals.css             # Terminal theme + keyframe animations
│   ├── layout.tsx              # Root layout with AuthProvider
│   └── page.tsx                # Main timeline page
├── components/
│   ├── auth-modal.tsx          # Login/Register modal
│   ├── date-card.tsx           # Individual date card with todos
│   ├── migrate-modal.tsx       # localStorage → DB migration prompt
│   └── terminal-background.tsx # 5-layer parallax SVG background
├── hooks/
│   └── use-todos.ts            # Smart hook: API or localStorage
└── lib/
    ├── auth-context.tsx        # Auth provider + hooks
    ├── db.ts                   # SQLite schema + connection
    ├── get-user.ts             # Server-side JWT verification
    └── types.ts                # Todo, DayData types
```

---

## 🐳 Deployment

TOODUU runs on Docker with Traefik as reverse proxy:

```yaml
# docker-compose.yml highlights
services:
  tooduu:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tooduu.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.tooduu.tls.certresolver=letsencrypt"
    volumes:
      - tooduu-data:/app/data  # Persistent SQLite
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT — do whatever you want with it.

---

<div align="center">

### ⭐ If you found this cool, drop a star — it helps others discover it!

**Built with 💚 and way too much caffeine**

*by [Yatin Arora](https://github.com/yatindma)*

</div>
