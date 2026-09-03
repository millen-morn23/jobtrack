import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'job_application'
      ORDER BY ordinal_position;
    `);

    console.table(result.rows);
  } catch (error) {
    console.error("❌ Could not check the table:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkTable();