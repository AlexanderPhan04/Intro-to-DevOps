const config = require("./config");
const logger = require("./utils/logger");
const { createPool } = require("./database/db");
const { migrate } = require("./database/migrate");
const { createTodoRepository } = require("./repositories/todo.repository");
const { createApp } = require("./app");

const SHUTDOWN_TIMEOUT_MS = 10000;

async function start() {
  const pool = createPool(config);
  pool.on("error", (error) =>
    logger.error("Unexpected database pool error", { error: error.message })
  );

  await migrate(pool, { logger });

  const app = createApp({
    todoRepository: createTodoRepository(pool),
    checkDatabase: () => pool.query("SELECT 1"),
    logger,
    version: config.appVersion,
    metricsToken: config.metricsToken,
  });

  const server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`, { env: config.env });
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async () => {
      await pool.end();
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
  logger.error("Failed to start server", { error: error.message, stack: error.stack });
  process.exit(1);
});
