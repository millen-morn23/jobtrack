CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS company_user_id_idx
  ON company(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS company_user_id_name_idx
  ON company(user_id, lower(name));
