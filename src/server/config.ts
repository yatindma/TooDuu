// Centralized configuration — single source of truth for all server settings

const config = {
  auth: {
    secret: new TextEncoder().encode(
      process.env.AUTH_SECRET || "fallback-secret"
    ),
    tokenExpiry: "30d",
    cookieName: "auth-token",
    cookieMaxAge: 60 * 60 * 24 * 30, // 30 days
    saltRounds: 10,
    minPasswordLength: 6,
  },
  db: {
    path: process.env.DB_PATH || "data/tooduu.db",
  },
  rateLimit: {
    windowMs: 60_000, // 1 minute
    maxRequests: 60, // per window per IP
    authMaxRequests: 10, // stricter for auth endpoints
  },
} as const;

export default config;
