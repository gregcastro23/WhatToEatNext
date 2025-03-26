type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info: (message: string, context?: any) => void;
  warn: (message: string, context?: any) => void;
  error: (messageOrError: string | Error, context?: any) => void;
  debug: (message: string, context?: any) => void;
  log: (level: LogLevel, message: string, context?: any) => void;
}

export const logger: Logger = {
  info: (message, context) => {
    logger.log('info', message || 'Info', context);
  },
  warn: (message, context) => {
    logger.log('warn', message || 'Warning', context);
  },
  error: (messageOrError, context) => {
    logger.log('error', messageOrError instanceof Error ? messageOrError.message : messageOrError, context);
  },
  debug: (message, context) => {
    logger.log('debug', message || 'Debug', context);
  },
  log: (level, message, context) => {
    const safeMessage = message ?? 'No message provided';
    const safeContext = context ?? '';
    
    if (typeof console[level] === 'function') {
      console[level](safeMessage, safeContext);
    } else {
      console.log(safeMessage, safeContext);
    }
  }
};

export default logger; 