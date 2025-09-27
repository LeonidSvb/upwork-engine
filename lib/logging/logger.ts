import winston from 'winston';
import path from 'path';
import { LogContext, LogEntry, APILogData, WebhookLogData, DatabaseLogData, OpenAILogData } from './types';

const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'upwork-system' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 14,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 14,
      tailable: true
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

function createLogEntry(
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  context?: LogContext,
  data?: any
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString()
  };
}

export const log = {
  error: (message: string, context?: LogContext, data?: any) => {
    const entry = createLogEntry('error', message, context, data);
    logger.error(entry);
  },

  warn: (message: string, context?: LogContext, data?: any) => {
    const entry = createLogEntry('warn', message, context, data);
    logger.warn(entry);
  },

  info: (message: string, context?: LogContext, data?: any) => {
    const entry = createLogEntry('info', message, context, data);
    logger.info(entry);
  },

  debug: (message: string, context?: LogContext, data?: any) => {
    const entry = createLogEntry('debug', message, context, data);
    logger.debug(entry);
  },

  // Специализированные методы для разных типов операций
  api: {
    request: (message: string, data: APILogData, context?: LogContext) => {
      log.info(`API Request: ${message}`, context, data);
    },

    response: (message: string, data: APILogData, context?: LogContext) => {
      if (data.statusCode && data.statusCode >= 400) {
        log.error(`API Error: ${message}`, context, data);
      } else {
        log.info(`API Success: ${message}`, context, data);
      }
    },

    error: (message: string, data: APILogData, context?: LogContext) => {
      log.error(`API Error: ${message}`, context, data);
    }
  },

  webhook: {
    received: (message: string, data: WebhookLogData, context?: LogContext) => {
      log.info(`Webhook Received: ${message}`, context, data);
    },

    processed: (message: string, data: WebhookLogData, context?: LogContext) => {
      log.info(`Webhook Processed: ${message}`, context, data);
    },

    error: (message: string, data: WebhookLogData, context?: LogContext) => {
      log.error(`Webhook Error: ${message}`, context, data);
    }
  },

  database: {
    query: (message: string, data: DatabaseLogData, context?: LogContext) => {
      log.debug(`Database Query: ${message}`, context, data);
    },

    success: (message: string, data: DatabaseLogData, context?: LogContext) => {
      log.info(`Database Success: ${message}`, context, data);
    },

    error: (message: string, data: DatabaseLogData, context?: LogContext) => {
      log.error(`Database Error: ${message}`, context, data);
    }
  },

  openai: {
    request: (message: string, data: OpenAILogData, context?: LogContext) => {
      log.info(`OpenAI Request: ${message}`, context, data);
    },

    response: (message: string, data: OpenAILogData, context?: LogContext) => {
      log.info(`OpenAI Response: ${message}`, context, data);
    },

    error: (message: string, data: OpenAILogData, context?: LogContext) => {
      log.error(`OpenAI Error: ${message}`, context, data);
    }
  }
};

// export default log;