// eslint-disable no-unused-vars
import { Logger, LogLevel } from '../types'
// eslint-enable no-unused-vars

export const nullLogger: Logger = {
    log: (log: string) => {},
    warn: (warn: string) => {},
    info: (info: string) => {},
    error: (error: string) => {},
}

const logConditionally = (level: LogLevel = 'SILENT') => (logger: Logger): Logger => {
    if (level === 'SILENT') return nullLogger
    if (level === 'DEBUG') return logger
    if (level === 'INFO') return { ...nullLogger, info: logger.info }
    if (level === 'LOG') return { ...nullLogger, info: logger.info, log: logger.log }
    if (level === 'WARN') return { ...logger, info: nullLogger.info, log: nullLogger.log }

    return logger
}

const defaultLogger: Logger = {
    log: (log: string) => console.log(`[Log]: ${log}`),
    warn: (warn: string) => console.warn(`[Warn]: ${warn}`),
    error: (error: string) => console.error(`[Error]: ${error}`),
    info: (info: string) => console.info(`[Info]: ${info}`),
}

export const createLogger = (
    logger: Logger = defaultLogger,
    logLevel: LogLevel = 'SILENT',
): Logger => (
    logConditionally(logLevel)(logger)
)
