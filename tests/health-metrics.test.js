const request = require("supertest");

const { buildApp } = require("./helpers/build-app");

describe("operational endpoints", () => {
  it("GET / returns service info", async () => {
    const res = await request(buildApp()).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "running", version: "test" });
  });

  it("GET /health returns ok when the database is reachable", async () => {
    const res = await request(buildApp()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", database: "up", version: "test" });
  });

  it("GET /health returns 503 when the database is down", async () => {
    const app = buildApp({
      checkDatabase: async () => {
        throw new Error("ECONNREFUSED");
      },
    });

    const res = await request(app).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: "degraded", database: "down" });
  });

  it("GET /metrics exposes Prometheus metrics", async () => {
    const app = buildApp();
    await request(app).get("/api/todos");

    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
    expect(res.text).toContain("http_request_duration_seconds");
    expect(res.text).toContain('route="/api/todos/"');
  });

  describe("with METRICS_TOKEN", () => {
    const app = buildApp({ metricsToken: "s3cret" });

    it("rejects requests without a valid token", async () => {
      const res = await request(app).get("/metrics").set("Authorization", "Bearer nope");

      expect(res.status).toBe(401);
    });

    it("accepts requests with the token", async () => {
      const res = await request(app).get("/metrics").set("Authorization", "Bearer s3cret");

      expect(res.status).toBe(200);
    });
  });
});
