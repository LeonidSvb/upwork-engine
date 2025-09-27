export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface APILogData {
  method: string;
  url: string;
  statusCode?: number;
  duration?: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

export interface WebhookLogData {
  source: string;
  payload?: any;
  batchId?: string;
  jobsCount?: number;
  error?: string;
}

export interface DatabaseLogData {
  operation: string;
  table: string;
  recordId?: string;
  recordsCount?: number;
  error?: string;
}

export interface OpenAILogData {
  model: string;
  prompt?: string;
  response?: string;
  tokensUsed?: number;
  cost?: number;
  error?: string;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: APILogData | WebhookLogData | DatabaseLogData | OpenAILogData;
  timestamp: string;
}