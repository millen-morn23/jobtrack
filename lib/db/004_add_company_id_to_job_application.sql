ALTER TABLE job_application
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES company(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS job_application_company_id_idx
  ON job_application(company_id);
