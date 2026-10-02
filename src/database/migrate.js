require("dotenv").config();

const pool = require("./db");

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database migration completed.");
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();