import pino from "pino";

// const PUSH_TO_MIDDLEWARE = process.env.NODE_ENV === "production";

export const _logger = pino({
  serializers: {
    err: pino.stdSerializers.err,
    res: pino.stdSerializers.res,
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const logger = {
  info: (...args: unknown[]) => {
    args.forEach((arg) => {
      _logger.info(arg);
    });
  },
  error: (...args: unknown[]) => {
    args.forEach((arg) => {
      _logger.error(arg);
    });
  },
  warn: (...args: unknown[]) => {
    args.forEach((arg) => {
      _logger.warn(arg);
    });
  },
  debug: (...args: unknown[]) => {
    args.forEach((arg) => {
      _logger.debug(arg);
    });
  },
};

export default logger;
