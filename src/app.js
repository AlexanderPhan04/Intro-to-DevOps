const express = require("express");
const helmet = require("helmet");

const { createTodoController } = require("./controllers/todo.controller");
const { createTodoRouter } = require("./routes/todo.routes");
const { createRequestLogger } = require("./middlewares/request-logger");
const {
  notFoundHandler,
  createErrorHandler,
} = require("./middlewares/error-handler");
const { createMetrics } = require("./monitoring/metrics");

/**
 * @param {object} deps
 * @param {object} deps.todoRepository  data access for todos
 * @param {() => Promise<unknown>} deps.checkDatabase  rejects when DB is unreachable
 * @param {object} deps.logger
 * @param {string} [deps.version]
 * @param {string} [deps.metricsToken]
 */
function createApp({
  todoRepository,
  checkDatabase,
  logger,
  version = "dev",
  metricsToken = "",
}) {
  const app = express();
  const metrics = createMetrics({ token: metricsToken });

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(metrics.middleware);
  app.use(createRequestLogger(logger));
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (req, res) => {
    res.json({ name: "Intro to DevOps API", status: "running", version });
  });

  app.get("/health", async (req, res) => {
    const body = {
      status: "ok",
      version,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: "up",
    };

    try {
      await checkDatabase();
    } catch (error) {
      logger.warn("Health check: database unreachable", { error: error.message });
      return res.status(503).json({ ...body, status: "degraded", database: "down" });
    }

    res.json(body);
  });

  app.get("/metrics", metrics.handler);

  app.use("/api/todos", createTodoRouter(createTodoController(todoRepository)));

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}

module.exports = { createApp };
