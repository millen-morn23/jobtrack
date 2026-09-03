import { readFileSync } from "node:fs";
import { Pool } from "pg";

const sql = readFileSync("lib/db/001_create_applications.sql", "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await pool.query(sql);
    console.log("✅ JobTrack application table created successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();