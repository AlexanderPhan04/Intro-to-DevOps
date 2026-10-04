const { createPool } = require("../src/database/db");
const { migrate, SCHEMA_SQL } = require("../src/database/migrate");

describe("database", () => {
  describe("createPool", () => {
    it("throws when DATABASE_URL is missing", () => {
      expect(() => createPool({ databaseUrl: "" })).toThrow("DATABASE_URL is not set");
    });

    it("creates a pool with optional SSL", async () => {
      const pool = createPool({
        databaseUrl: "postgresql://u:p@localhost:5432/db",
        databaseSsl: true,
      });

      expect(pool.options.ssl).toEqual({ rejectUnauthorized: false });
      await pool.end();
    });
  });

  describe("migrate", () => {
    it("runs the schema SQL", async () => {
      const db = { query: jest.fn().mockResolvedValue({}) };
      const logger = { info: jest.fn(), warn: jest.fn() };

      await migrate(db, { logger });

      expect(db.query).toHaveBeenCalledWith(SCHEMA_SQL);
      expect(logger.info).toHaveBeenCalled();
    });

    it("retries until the database is ready", async () => {
      const db = {
        query: jest
          .fn()
          .mockRejectedValueOnce(new Error("not ready"))
          .mockResolvedValueOnce({}),
      };
      const logger = { info: jest.fn(), warn: jest.fn() };

      await migrate(db, { retries: 3, delayMs: 1, logger });

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("throws after exhausting retries", async () => {
      const db = { query: jest.fn().mockRejectedValue(new Error("down")) };

      await expect(migrate(db, { retries: 2, delayMs: 1 })).rejects.toThrow("down");
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });
});
