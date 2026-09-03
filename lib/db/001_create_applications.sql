CREATE TABLE IF NOT EXISTS job_application (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Applied',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT job_application_status_check
    CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected'))
);

CREATE INDEX IF NOT EXISTS job_application_user_id_idx
  ON job_application(user_id);