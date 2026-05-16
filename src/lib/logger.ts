/**
 * Structured logger untuk Kombinara.
 * - Development : output berwarna ke terminal
 * - Production  : JSON satu baris (kompatibel dengan Vercel / Railway / Fly.io log aggregator)
 * - Edge Runtime: hanya pakai console — tidak ada dependensi Node.js
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

function log(level: LogLevel, module: string, message: string, meta?: LogMeta): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    env: process.env.NODE_ENV ?? "development",
    ...(meta ?? {}),
  };

  if (process.env.NODE_ENV === "production") {
    // JSON satu baris — mudah di-parse oleh log aggregator
    const fn =
      level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    // Pretty output berwarna untuk development
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m",  // green
      warn: "\x1b[33m",  // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const metaStr = meta ? " " + JSON.stringify(meta) : "";
    const fn =
      level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(
      `${colors[level]}[${level.toUpperCase()}]${reset} [${entry.timestamp}] [${module}] ${message}${metaStr}`
    );
  }
}

export const logger = {
  debug: (module: string, message: string, meta?: LogMeta) =>
    log("debug", module, message, meta),
  info: (module: string, message: string, meta?: LogMeta) =>
    log("info", module, message, meta),
  warn: (module: string, message: string, meta?: LogMeta) =>
    log("warn", module, message, meta),
  error: (module: string, message: string, meta?: LogMeta) =>
    log("error", module, message, meta),
};
