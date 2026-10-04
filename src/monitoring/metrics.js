const crypto = require("node:crypto");
const client = require("prom-client");

function tokensMatch(expected, provided) {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createMetrics({ token = "" } = {}) {
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  });

  function middleware(req, res, next) {
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => {
      const route = req.route ? `${req.baseUrl}${req.route.path}` : "unmatched";
      end({ method: req.method, route, status_code: res.statusCode });
    });
    next();
  }

  async function handler(req, res) {
    if (token) {
      const provided = (req.get("authorization") || "").replace(/^Bearer /, "");
      if (!tokensMatch(token, provided)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics());
  }

  return { register, middleware, handler };
}

module.exports = { createMetrics };
