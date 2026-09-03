import type {
  Application,
  ApplicationRecord,
  CompanyRecord,
  CompanyWithCounts,
  Contact,
  ContactRecord,
} from "@/lib/types";

export function formatDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function mapApplication(record: ApplicationRecord): Application {
  return {
    id: record.id,
    company: record.company,
    companyId: record.company_id,
    companyName: record.company_name,
    position: record.position,
    location: record.location || "",
    dateApplied: formatDate(record.date_applied),
    rawDateApplied: record.date_applied,
    status: record.status,
    notes: record.notes || "",
  };
}

export function mapCompany(record: CompanyRecord): CompanyWithCounts {
  return {
    id: record.id,
    name: record.name,
    website: record.website || "",
    industry: record.industry || "",
    location: record.location || "",
    notes: record.notes || "",
    contactCount: record.contact_count,
    applicationCount: record.application_count,
  };
}

export function mapContact(record: ContactRecord): Contact {
  return {
    id: record.id,
    companyId: record.company_id,
    companyName: record.company_name || "",
    firstName: record.first_name,
    lastName: record.last_name,
    jobTitle: record.job_title || "",
    email: record.email || "",
    phone: record.phone || "",
    notes: record.notes || "",
  };
}

export type { Application, CompanyWithCounts, Contact };
