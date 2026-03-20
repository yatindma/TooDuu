import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import config from "../config";

const DB_PATH = path.resolve(process.cwd(), config.db.path);

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Production-grade SQLite pragmas for 10K concurrent users
db.pragma("journal_mode = WAL"); // Write-Ahead Logging for concurrent reads
db.pragma("busy_timeout = 10000"); // 10s timeout for locked DB
db.pragma("synchronous = NORMAL"); // Faster writes, still safe with WAL
db.pragma("cache_size = -64000"); // 64MB page cache (negative = KB)
db.pragma("foreign_keys = ON"); // Enforce FK constraints
db.pragma("temp_store = MEMORY"); // Temp tables in memory
db.pragma("mmap_size = 268435456"); // 256MB memory-mapped I/O
db.pragma("wal_autocheckpoint = 1000"); // Checkpoint every 1000 pages

export default db;
