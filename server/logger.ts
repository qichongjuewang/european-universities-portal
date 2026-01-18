/**
 * 日志记录系统
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最多保存1000条日志

  log(level: LogLevel, module: string, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      error: error?.message,
    };

    this.logs.push(entry);

    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 同时输出到控制台
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${module}]`;
    const logMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data, error);
        break;
    }
  }

  debug(module: string, message: string, data?: any) {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any, error?: Error) {
    this.log('error', module, message, data, error);
  }

  getLogs(filter?: { level?: LogLevel; module?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.module) {
      filtered = filtered.filter((log) => log.module === filter.module);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      debug: this.logs.filter((l) => l.level === 'debug').length,
      info: this.logs.filter((l) => l.level === 'info').length,
      warn: this.logs.filter((l) => l.level === 'warn').length,
      error: this.logs.filter((l) => l.level === 'error').length,
    };
    return stats;
  }
}

export const logger = new Logger();
