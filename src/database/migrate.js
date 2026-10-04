const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function migrate(db, { retries = 5, delayMs = 2000, logger } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await db.query(SCHEMA_SQL);
      logger?.info("Database migration completed");
      return;
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      logger?.warn(`Migration attempt ${attempt} failed, retrying in ${delayMs}ms`, {
        error: error.message,
      });
      await sleep(delayMs);
    }
  }
}

module.exports = { migrate, SCHEMA_SQL };

/* istanbul ignore next */
if (require.main === module) {
  const config = require("../config");
  const logger = require("../utils/logger");
  const { createPool } = require("./db");

  const pool = createPool(config);

  migrate(pool, { logger })
    .catch((error) => {
      logger.error("Database migration failed", { error: error.message });
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
