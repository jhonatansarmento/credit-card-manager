type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, meta);
    console.log(formatLog(entry));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, meta);
    console.warn(formatLog(entry));
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, {
      ...meta,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error(formatLog(entry));
  },
};
