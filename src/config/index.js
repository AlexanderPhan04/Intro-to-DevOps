require("dotenv").config({ quiet: true });

const config = Object.freeze({
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 9000,
  logLevel: process.env.LOG_LEVEL || "http",
  appVersion: process.env.APP_VERSION || "dev",
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  metricsToken: process.env.METRICS_TOKEN || "",
});

module.exports = config;
