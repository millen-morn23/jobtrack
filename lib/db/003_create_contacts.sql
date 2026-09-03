CREATE TABLE IF NOT EXISTS contact (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS contact_user_id_idx
  ON contact(user_id);

CREATE INDEX IF NOT EXISTS contact_company_id_idx
  ON contact(company_id);
