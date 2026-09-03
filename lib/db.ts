import { Pool, types } from "pg";

// Postgres DATE (OID 1082) would otherwise be parsed into a JS Date and then
// serialized by JSON.stringify as a full ISO datetime, breaking date-only
// formatting on the client. Keep it as the raw "YYYY-MM-DD" string instead.
types.setTypeParser(1082, (value) => value);

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
