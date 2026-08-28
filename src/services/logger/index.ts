/**
 * Logger utility — centralised logging with level filtering.
 * In production, this would integrate with Crashlytics / Sentry.
 */
import { ENV, LogLevel } from '../config/env';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[ENV.LOG_LEVEL];
}

function formatMessage(level: string, tag: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
}

export const Logger = {
  debug(tag: string, message: string, data?: unknown): void {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', tag, message), data ?? '');
    }
  },
  info(tag: string, message: string, data?: unknown): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', tag, message), data ?? '');
    }
  },
  warn(tag: string, message: string, data?: unknown): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', tag, message), data ?? '');
    }
  },
  error(tag: string, message: string, error?: unknown): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', tag, message), error ?? '');
    }
  },

  /**
   * Crash-reporting abstraction.
   * In production: forward to Sentry / Crashlytics.
   */
  captureException(tag: string, error: unknown): void {
    this.error(tag, 'Captured exception', error);
    // TODO: forward to Sentry.captureException(error) in production
  },
};
