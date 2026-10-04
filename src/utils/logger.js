const winston = require("winston");

const config = require("../config");

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} ${level}: ${message}${extra}${stack ? `\n${stack}` : ""}`;
});

const logger = winston.createLogger({
  level: config.logLevel,
  silent: config.env === "test",
  defaultMeta: { service: "intro-devops-api", version: config.appVersion },
  format: combine(timestamp(), errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      format:
        config.env === "production"
          ? json()
          : combine(colorize(), devFormat),
    }),
  ],
});

module.exports = logger;
