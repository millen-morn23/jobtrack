import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const migrationsDir = path.join(process.cwd(), "lib", "db");

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  try {
    for (const file of migrationFiles) {
      const sql = readFileSync(path.join(migrationsDir, file), "utf8");
      await pool.query(sql);
      console.log(`✅ Ran migration: ${file}`);
    }

    console.log("✅ All JobTrack migrations completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
