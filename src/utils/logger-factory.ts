import winston, { Logger } from "winston";
import { TransformableInfo } from "logform";

export class LoggerFactory {
  public static readonly info: string = "info";
  public static readonly debug: string = "debug";

  public static getLogger(loggerName: string, logLevel: string = this.debug): Logger {
    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.label({ label: loggerName }),
        winston.format.timestamp(),
        winston.format.printf(printfTemplate)
      ),
      transports: [new winston.transports.Console({ handleExceptions: true })],
      exceptionHandlers: [new winston.transports.Console({ handleExceptions: true })],
    });
  }
}

export const printfTemplate = ({ level, message, label, timestamp, ...metadata }: TransformableInfo) =>
  JSON.stringify({
    severity: level.toUpperCase(),
    message,
    ...metadata,
    logger: label,
    timestamp,
  });
