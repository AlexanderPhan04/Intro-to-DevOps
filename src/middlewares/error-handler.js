function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function createErrorHandler(logger) {
  // Express identifies error handlers by their 4-argument signature.
  // eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Malformed JSON body" });
    }

    logger.error("Unhandled error", {
      error: error.message,
      stack: error.stack,
      method: req.method,
      path: req.originalUrl,
    });

    res.status(500).json({ message: "Internal server error" });
  };
}

module.exports = { notFoundHandler, createErrorHandler };
