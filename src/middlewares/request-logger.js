const morgan = require("morgan");

const QUIET_PATHS = new Set(["/health", "/metrics"]);

function createRequestLogger(logger) {
  return morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
      skip: (req) => QUIET_PATHS.has(req.path),
      stream: { write: (line) => logger.http(line.trim()) },
    }
  );
}

module.exports = { createRequestLogger };
