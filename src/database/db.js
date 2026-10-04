const { Pool } = require("pg");

function createPool({ databaseUrl, databaseSsl }) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return new Pool({
    connectionString: databaseUrl,
    ssl: databaseSsl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

module.exports = { createPool };
