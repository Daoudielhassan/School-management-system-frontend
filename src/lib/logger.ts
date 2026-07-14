/**
 * Logger — structured, leveled, scoped logging utility
 *
 * Features:
 *  - Five log levels: DEBUG < INFO < WARN < ERROR < FATAL
 *  - Scoped loggers (per module / component)
 *  - Structured log entries (timestamp, level, scope, message, data, error)
 *  - Color-coded console output in development
 *  - In-memory ring buffer for runtime inspection
 *  - Performance timer helpers
 *  - API-specific request/response/error helpers
 *  - Pluggable remote transport (no-op by default, attach in _app or providers)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: string;       // ISO-8601
  level: LogLevel;
  scope: string;           // logger name / module
  message: string;
  data?: unknown;          // arbitrary structured context
  error?: SerializedError;
  durationMs?: number;     // attached by timer helpers
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  status?: number;         // HTTP status when available
  cause?: string;
}

export type RemoteTransport = (entry: LogEntry) => void;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_SERVER = typeof window === 'undefined';

const LEVEL_RANK: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO:  1,
  WARN:  2,
  ERROR: 3,
  FATAL: 4,
};

/**
 * Minimum level to emit. Override with NEXT_PUBLIC_LOG_LEVEL env var.
 * Defaults to DEBUG in development, WARN in production.
 */
const CONFIGURED_LEVEL: LogLevel = (() => {
  const env = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (env && env in LEVEL_RANK) return env;
  return IS_DEV ? 'DEBUG' : 'WARN';
})();

// ---------------------------------------------------------------------------
// In-memory ring buffer
// ---------------------------------------------------------------------------

const BUFFER_SIZE = 200;
const _buffer: LogEntry[] = [];

/** Returns a snapshot of all buffered log entries (newest last). */
export function getLogBuffer(): ReadonlyArray<LogEntry> {
  return [..._buffer];
}

/** Clears the in-memory log buffer. */
export function clearLogBuffer(): void {
  _buffer.splice(0, _buffer.length);
}

function pushToBuffer(entry: LogEntry): void {
  if (_buffer.length >= BUFFER_SIZE) _buffer.shift();
  _buffer.push(entry);
}

// ---------------------------------------------------------------------------
// Remote transport registry
// ---------------------------------------------------------------------------

const _transports: RemoteTransport[] = [];

/**
 * Register a remote transport (e.g. Sentry, Datadog, custom endpoint).
 * Called for every log entry at or above ERROR level, and for any level
 * if the transport was registered with `all: true`.
 *
 * @example
 *   addTransport((entry) => {
 *     if (entry.level === 'ERROR' || entry.level === 'FATAL') {
 *       Sentry.captureMessage(entry.message, { extra: entry });
 *     }
 *   });
 */
export function addTransport(transport: RemoteTransport): void {
  _transports.push(transport);
}

export function removeTransport(transport: RemoteTransport): void {
  const idx = _transports.indexOf(transport);
  if (idx !== -1) _transports.splice(idx, 1);
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

function serializeError(err: unknown): SerializedError {
  if (err instanceof Error) {
    const typed = err as Error & { status?: number; cause?: unknown };
    return {
      name:    err.name,
      message: err.message,
      stack:   IS_DEV ? err.stack : undefined,
      status:  typed.status,
      cause:   typed.cause != null ? String(typed.cause) : undefined,
    };
  }
  return {
    name:    'UnknownError',
    message: String(err),
  };
}

function truncate(value: unknown, maxLen = 3000): unknown {
  if (value == null) return value;
  const str = typeof value === 'string' ? value : (() => {
    try { return JSON.stringify(value); } catch { return '[unserializable]'; }
  })();
  return str.length > maxLen ? str.slice(0, maxLen) + '… [truncated]' : value;
}

// ---------------------------------------------------------------------------
// Console output
// ---------------------------------------------------------------------------

const COLORS: Record<LogLevel, string> = {
  DEBUG: '#8b9dc3',
  INFO:  '#2ecc71',
  WARN:  '#f39c12',
  ERROR: '#e74c3c',
  FATAL: '#9b59b6',
};

const CONSOLE_FN: Record<LogLevel, (...args: unknown[]) => void> = {
  DEBUG: console.debug.bind(console),
  INFO:  console.info.bind(console),
  WARN:  console.warn.bind(console),
  ERROR: console.error.bind(console),
  FATAL: console.error.bind(console),
};

function emitToConsole(entry: LogEntry): void {
  const { level, scope, message, data, error, durationMs, timestamp } = entry;
  const time = timestamp.slice(11, 23); // HH:MM:SS.mmm

  if (IS_SERVER) {
    // Plain text on the server (Node.js / Next.js SSR)
    const suffix = durationMs !== undefined ? ` (${durationMs}ms)` : '';
    const fn = CONSOLE_FN[level];
    if (data !== undefined || error !== undefined) {
      fn(`[${time}] [${level}] [${scope}] ${message}${suffix}`, { data, error });
    } else {
      fn(`[${time}] [${level}] [${scope}] ${message}${suffix}`);
    }
    return;
  }

  // Styled browser console
  const color = COLORS[level];
  const suffix = durationMs !== undefined ? ` ⏱ ${durationMs}ms` : '';
  const style = `color: ${color}; font-weight: bold`;
  const fn = CONSOLE_FN[level];

  if (data !== undefined || error !== undefined) {
    fn(
      `%c[${time}] [${level}] [${scope}]%c ${message}${suffix}`,
      style, 'color: inherit',
      ...(data !== undefined ? ['→', data] : []),
      ...(error !== undefined ? ['✖', error] : []),
    );
  } else {
    fn(
      `%c[${time}] [${level}] [${scope}]%c ${message}${suffix}`,
      style, 'color: inherit',
    );
  }
}

// ---------------------------------------------------------------------------
// Core emit
// ---------------------------------------------------------------------------

function emit(
  level: LogLevel,
  scope: string,
  message: string,
  data?: unknown,
  error?: unknown,
  durationMs?: number,
): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[CONFIGURED_LEVEL]) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    data:      data !== undefined ? truncate(data) : undefined,
    error:     error !== undefined ? serializeError(error) : undefined,
    durationMs,
  };

  pushToBuffer(entry);
  emitToConsole(entry);

  if (_transports.length > 0) {
    for (const transport of _transports) {
      try { transport(entry); } catch { /* never let a transport crash the app */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Scoped Logger class
// ---------------------------------------------------------------------------

export class Logger {
  constructor(public readonly scope: string) {}

  debug(message: string, data?: unknown): void {
    emit('DEBUG', this.scope, message, data);
  }

  info(message: string, data?: unknown): void {
    emit('INFO', this.scope, message, data);
  }

  warn(message: string, data?: unknown): void {
    emit('WARN', this.scope, message, data);
  }

  error(message: string, error?: unknown, data?: unknown): void {
    emit('ERROR', this.scope, message, data, error);
  }

  fatal(message: string, error?: unknown, data?: unknown): void {
    emit('FATAL', this.scope, message, data, error);
  }

  /**
   * Start a named performance timer. Returns a function that, when called,
   * logs an INFO entry with the elapsed duration.
   *
   * @example
   *   const done = logger.startTimer('fetchUsers');
   *   await loadUsers();
   *   done();                  // logs "fetchUsers completed" with duration
   *   done('custom message');  // override the completion message
   */
  startTimer(label: string): (message?: string) => void {
    const start = Date.now();
    return (message?: string) => {
      emit('INFO', this.scope, message ?? `${label} completed`, undefined, undefined, Date.now() - start);
    };
  }

  /**
   * Wrap an async function and automatically log its start, success, and
   * failure with timing. Returns the same Promise.
   *
   * @example
   *   const users = await logger.track('fetchUsers', () => api.getUsers(token));
   */
  async track<T>(label: string, fn: () => Promise<T>, data?: unknown): Promise<T> {
    const start = Date.now();
    this.debug(`${label} started`, data);
    try {
      const result = await fn();
      emit('INFO', this.scope, `${label} succeeded`, undefined, undefined, Date.now() - start);
      return result;
    } catch (err) {
      emit('ERROR', this.scope, `${label} failed`, data, err, Date.now() - start);
      throw err;
    }
  }

  /**
   * Log an outgoing API request.
   */
  logRequest(method: string, url: string, payload?: unknown): void {
    this.debug(`→ ${method} ${url}`, payload !== undefined ? { payload: truncate(payload) } : undefined);
  }

  /**
   * Log a successful API response.
   */
  logResponse(method: string, url: string, status: number, durationMs: number, data?: unknown): void {
    emit(
      status >= 400 ? 'WARN' : 'INFO',
      this.scope,
      `← ${status} ${method} ${url}`,
      data !== undefined ? { response: truncate(data) } : undefined,
      undefined,
      durationMs,
    );
  }

  /**
   * Log a failed API call (network error or HTTP 4xx/5xx).
   */
  logApiError(method: string, url: string, error: unknown, durationMs?: number): void {
    emit('ERROR', this.scope, `✖ ${method} ${url}`, undefined, error, durationMs);
  }

  /**
   * Log a user action / UI event.
   */
  action(name: string, data?: unknown): void {
    emit('INFO', this.scope, `[action] ${name}`, data);
  }

  /**
   * Create a child logger with a sub-scope (e.g. "Auth/login").
   */
  child(subScope: string): Logger {
    return new Logger(`${this.scope}/${subScope}`);
  }
}

// ---------------------------------------------------------------------------
// Factory / global registry
// ---------------------------------------------------------------------------

const _registry = new Map<string, Logger>();

/**
 * Get (or create) a scoped logger. Identical scope strings return the same
 * instance, so loggers can be module-level singletons without overhead.
 *
 * @example
 *   const logger = createLogger('AuthContext');
 *   logger.info('User logged in', { userId });
 */
export function createLogger(scope: string): Logger {
  if (!_registry.has(scope)) {
    _registry.set(scope, new Logger(scope));
  }
  return _registry.get(scope)!;
}

// ---------------------------------------------------------------------------
// Root logger (convenience)
// ---------------------------------------------------------------------------

/** Root logger with scope "App". Use for top-level / global events. */
export const logger = createLogger('App');

// ---------------------------------------------------------------------------
// Diagnostic helpers
// ---------------------------------------------------------------------------

/**
 * Dump the current log buffer to the console as a table.
 * Useful during debugging — call from the browser DevTools console:
 *   import { dumpLogs } from '@/lib/logger'; dumpLogs();
 */
export function dumpLogs(level?: LogLevel): void {
  const entries = level
    ? _buffer.filter((e) => e.level === level)
    : [..._buffer];

  if (entries.length === 0) {
    console.info('[Logger] No log entries in buffer.');
    return;
  }

  console.group(`[Logger] Buffer (${entries.length} entries${level ? `, level=${level}` : ''})`);
  console.table(
    entries.map((e) => ({
      time:      e.timestamp.slice(11, 23),
      level:     e.level,
      scope:     e.scope,
      message:   e.message,
      duration:  e.durationMs !== undefined ? `${e.durationMs}ms` : '',
      hasData:   e.data !== undefined,
      hasError:  e.error !== undefined,
    })),
  );
  console.groupEnd();
}

/**
 * Returns an object with error counts per scope, useful for spotting
 * which module is generating the most errors.
 */
export function getErrorSummary(): Record<string, number> {
  return _buffer
    .filter((e) => e.level === 'ERROR' || e.level === 'FATAL')
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.scope] = (acc[e.scope] ?? 0) + 1;
      return acc;
    }, {});
}
