export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as string[]).includes(value);
}

/** Raw shape returned by /api/applications (snake_case, matches DB columns). */
export type ApplicationRecord = {
  id: number;
  company: string;
  company_id: number | null;
  company_name: string | null;
  position: string;
  location: string | null;
  date_applied: string;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Raw shape returned by /api/companies (snake_case, matches DB columns). */
export type CompanyRecord = {
  id: number;
  name: string;
  website: string | null;
  industry: string | null;
  location: string | null;
  notes: string | null;
  contact_count: number;
  application_count: number;
  created_at: string;
  updated_at: string;
};

/** Raw shape returned by /api/companies/{id} (includes nested contacts/applications). */
export type CompanyDetailRecord = CompanyRecord & {
  contacts: ContactRecord[];
  applications: Pick<
    ApplicationRecord,
    "id" | "position" | "status" | "date_applied"
  >[];
};

/** Raw shape returned by /api/contacts (snake_case, matches DB columns). */
export type ContactRecord = {
  id: number;
  company_id: number;
  company_name?: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiErrorResponse = {
  error: string;
};

/** Client-facing (camelCase) shape used by UI components. */
export type Application = {
  id: number;
  company: string;
  companyId: number | null;
  companyName: string | null;
  position: string;
  location: string;
  dateApplied: string;
  rawDateApplied: string;
  status: ApplicationStatus;
  notes: string;
};

/** Client-facing (camelCase) shape used by UI components. */
export type CompanyWithCounts = {
  id: number;
  name: string;
  website: string;
  industry: string;
  location: string;
  notes: string;
  contactCount: number;
  applicationCount: number;
};

/** Client-facing (camelCase) shape used by UI components. */
export type Contact = {
  id: number;
  companyId: number;
  companyName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  notes: string;
};
