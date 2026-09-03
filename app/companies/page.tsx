"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import FormField, { fieldInputClassName } from "@/components/FormField";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";
import SuccessBanner from "@/components/SuccessBanner";
import StatusBadge from "@/components/StatusBadge";
import CompanyCard from "@/components/CompanyCard";
import { mapCompany, mapContact } from "@/lib/mappers";
import type {
  ApplicationRecord,
  CompanyDetailRecord,
  CompanyRecord,
  CompanyWithCounts,
  Contact,
  ContactRecord,
} from "@/lib/types";

type CompanyFormState = {
  name: string;
  website: string;
  industry: string;
  location: string;
  notes: string;
};

const emptyCompanyForm: CompanyFormState = {
  name: "",
  website: "",
  industry: "",
  location: "",
  notes: "",
};

type ContactFormState = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  notes: string;
};

const emptyContactForm: ContactFormState = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  email: "",
  phone: "",
  notes: "",
};

type CompanyDetail = {
  contacts: Contact[];
  applications: Pick<
    ApplicationRecord,
    "id" | "position" | "status" | "date_applied"
  >[];
};

export default function CompaniesPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] =
    useState<CompanyWithCounts | null>(null);
  const [companyForm, setCompanyForm] =
    useState<CompanyFormState>(emptyCompanyForm);
  const [companyFormError, setCompanyFormError] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  const [deletingCompany, setDeletingCompany] =
    useState<CompanyWithCounts | null>(null);
  const [deletingCompanyBusy, setDeletingCompanyBusy] = useState(false);

  const [viewingCompany, setViewingCompany] =
    useState<CompanyWithCounts | null>(null);
  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] =
    useState<ContactFormState>(emptyContactForm);
  const [contactFormError, setContactFormError] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deletingContactBusy, setDeletingContactBusy] = useState(false);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setError("");
        const response = await fetch("/api/companies");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load companies.");
        }

        const data: { companies: CompanyRecord[] } = await response.json();
        setCompanies(data.companies.map(mapCompany));
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load your companies. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, [router]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  function openCreateForm() {
    setEditingCompany(null);
    setCompanyForm(emptyCompanyForm);
    setCompanyFormError("");
    setFormOpen(true);
  }

  function openEditForm(company: CompanyWithCounts) {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      website: company.website,
      industry: company.industry,
      location: company.location,
      notes: company.notes,
    });
    setCompanyFormError("");
    setFormOpen(true);
  }

  function closeCompanyForm() {
    setFormOpen(false);
    setEditingCompany(null);
    setCompanyForm(emptyCompanyForm);
    setCompanyFormError("");
  }

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyForm.name.trim()) {
      setCompanyFormError("Company name is required.");
      return;
    }

    try {
      setSavingCompany(true);
      setCompanyFormError("");

      const endpoint = editingCompany
        ? `/api/companies/${editingCompany.id}`
        : "/api/companies";

      const response = await fetch(endpoint, {
        method: editingCompany ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save company.");
      }

      const savedCompany = mapCompany({
        ...data.company,
        contact_count: editingCompany?.contactCount ?? 0,
        application_count: editingCompany?.applicationCount ?? 0,
      });

      setCompanies((current) => {
        if (editingCompany) {
          return current
            .map((company) =>
              company.id === savedCompany.id ? savedCompany : company,
            )
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        return [...current, savedCompany].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      setSuccessMessage(
        editingCompany
          ? "Company updated successfully."
          : "Company added successfully.",
      );
      closeCompanyForm();
    } catch (submitError) {
      setCompanyFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save company.",
      );
    } finally {
      setSavingCompany(false);
    }
  }

  async function confirmDeleteCompany() {
    if (!deletingCompany) return;

    try {
      setDeletingCompanyBusy(true);
      setError("");

      const response = await fetch(`/api/companies/${deletingCompany.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete company.");
      }

      setCompanies((current) =>
        current.filter((company) => company.id !== deletingCompany.id),
      );
      setSuccessMessage("Company deleted successfully.");

      if (viewingCompany?.id === deletingCompany.id) {
        setViewingCompany(null);
        setCompanyDetail(null);
      }

      setDeletingCompany(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete company.",
      );
      setDeletingCompany(null);
    } finally {
      setDeletingCompanyBusy(false);
    }
  }

  async function openCompanyDetail(company: CompanyWithCounts) {
    setViewingCompany(company);
    setCompanyDetail(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await fetch(`/api/companies/${company.id}`);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load company details.");
      }

      const data: { company: CompanyDetailRecord } = await response.json();

      setCompanyDetail({
        contacts: data.company.contacts.map((contact: ContactRecord) =>
          mapContact(contact),
        ),
        applications: data.company.applications,
      });
    } catch (detailLoadError) {
      setDetailError(
        detailLoadError instanceof Error
          ? detailLoadError.message
          : "Unable to load company details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeCompanyDetail() {
    setViewingCompany(null);
    setCompanyDetail(null);
    setDetailError("");
  }

  function openCreateContactForm() {
    setEditingContact(null);
    setContactForm(emptyContactForm);
    setContactFormError("");
    setContactFormOpen(true);
  }

  function openEditContactForm(contact: Contact) {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      jobTitle: contact.jobTitle,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
    });
    setContactFormError("");
    setContactFormOpen(true);
  }

  function closeContactForm() {
    setContactFormOpen(false);
    setEditingContact(null);
    setContactForm(emptyContactForm);
    setContactFormError("");
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!viewingCompany) return;

    if (!contactForm.firstName.trim() || !contactForm.lastName.trim()) {
      setContactFormError("First and last name are required.");
      return;
    }

    try {
      setSavingContact(true);
      setContactFormError("");

      const endpoint = editingContact
        ? `/api/contacts/${editingContact.id}`
        : "/api/contacts";

      const response = await fetch(endpoint, {
        method: editingContact ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          companyId: viewingCompany.id,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save contact.");
      }

      const savedContact = mapContact(data.contact);

      setCompanyDetail((current) => {
        if (!current) return current;

        if (editingContact) {
          return {
            ...current,
            contacts: current.contacts.map((contact) =>
              contact.id === savedContact.id ? savedContact : contact,
            ),
          };
        }

        return { ...current, contacts: [...current.contacts, savedContact] };
      });

      setCompanies((current) =>
        current.map((company) =>
          company.id === viewingCompany.id && !editingContact
            ? { ...company, contactCount: company.contactCount + 1 }
            : company,
        ),
      );

      setSuccessMessage(
        editingContact
          ? "Contact updated successfully."
          : "Contact added successfully.",
      );
      closeContactForm();
    } catch (submitError) {
      setContactFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save contact.",
      );
    } finally {
      setSavingContact(false);
    }
  }

  async function confirmDeleteContact() {
    if (!deletingContact || !viewingCompany) return;

    try {
      setDeletingContactBusy(true);

      const response = await fetch(`/api/contacts/${deletingContact.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete contact.");
      }

      setCompanyDetail((current) =>
        current
          ? {
              ...current,
              contacts: current.contacts.filter(
                (contact) => contact.id !== deletingContact.id,
              ),
            }
          : current,
      );

      setCompanies((current) =>
        current.map((company) =>
          company.id === viewingCompany.id
            ? {
                ...company,
                contactCount: Math.max(0, company.contactCount - 1),
              }
            : company,
        ),
      );

      setSuccessMessage("Contact deleted successfully.");
      setDeletingContact(null);
    } catch (deleteError) {
      setDetailError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete contact.",
      );
      setDeletingContact(null);
    } finally {
      setDeletingContactBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Company management"
          title="Companies"
          description="Keep track of companies you're targeting, along with your contacts there."
          action={
            <Button type="button" onClick={openCreateForm}>
              Add Company
            </Button>
          }
        />

        {error && <ErrorBanner message={error} />}
        {successMessage && <SuccessBanner message={successMessage} />}

        <section aria-labelledby="companies-heading">
          <div className="mb-4">
            <h2 id="companies-heading" className="text-2xl font-semibold">
              My Companies
            </h2>
            <p className="text-sm text-slate-600">
              {companies.length} compan{companies.length === 1 ? "y" : "ies"}{" "}
              tracked
            </p>
          </div>

          {loading ? (
            <LoadingState label="Loading your companies..." />
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies yet"
              description="Add a company you're researching or applying to."
              action={<Button onClick={openCreateForm}>Add Company</Button>}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onView={openCompanyDetail}
                  onEdit={openEditForm}
                  onDelete={setDeletingCompany}
                />
              ))}
            </div>
          )}
        </section>

        {formOpen && (
          <Modal
            title={editingCompany ? "Update Company" : "Add Company"}
            description={
              editingCompany
                ? "Update information for this company."
                : "Track a new company you're researching or applying to."
            }
            onClose={closeCompanyForm}
          >
            <form
              onSubmit={handleCompanySubmit}
              className="space-y-4"
              noValidate
            >
              {companyFormError && <ErrorBanner message={companyFormError} />}

              <FormField id="name" label="Company name" required>
                <input
                  id="name"
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Acme Inc"
                  className={fieldInputClassName}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="website" label="Website" hint="Include https://">
                  <input
                    id="website"
                    type="url"
                    value={companyForm.website}
                    onChange={(event) =>
                      setCompanyForm((current) => ({
                        ...current,
                        website: event.target.value,
                      }))
                    }
                    placeholder="https://acme.com"
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="industry" label="Industry">
                  <input
                    id="industry"
                    type="text"
                    value={companyForm.industry}
                    onChange={(event) =>
                      setCompanyForm((current) => ({
                        ...current,
                        industry: event.target.value,
                      }))
                    }
                    placeholder="Software"
                    className={fieldInputClassName}
                  />
                </FormField>
              </div>

              <FormField id="location" label="Location">
                <input
                  id="location"
                  type="text"
                  value={companyForm.location}
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="San Francisco, CA"
                  className={fieldInputClassName}
                />
              </FormField>

              <FormField id="notes" label="Notes">
                <textarea
                  id="notes"
                  rows={3}
                  value={companyForm.notes}
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Research notes about this company"
                  className={fieldInputClassName}
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeCompanyForm}
                  disabled={savingCompany}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={savingCompany}
                  loadingText="Saving..."
                >
                  {editingCompany ? "Save Changes" : "Add Company"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {deletingCompany && (
          <ConfirmDialog
            title="Delete this company?"
            description={`This removes ${deletingCompany.name} and all of its contacts. Linked applications will keep their company name but no longer link to this record.`}
            loading={deletingCompanyBusy}
            onConfirm={confirmDeleteCompany}
            onCancel={() => setDeletingCompany(null)}
          />
        )}

        {viewingCompany && (
          <Modal
            title={viewingCompany.name}
            description="Contacts and applications linked to this company."
            onClose={closeCompanyDetail}
            className="max-w-2xl"
          >
            {detailError && <ErrorBanner message={detailError} />}

            {detailLoading ? (
              <LoadingState label="Loading company details..." />
            ) : (
              companyDetail && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Contacts
                      </h3>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={openCreateContactForm}
                      >
                        Add Contact
                      </Button>
                    </div>

                    {companyDetail.contacts.length === 0 ? (
                      <EmptyState
                        title="No contacts yet"
                        description="Add a recruiter or hiring manager for this company."
                      />
                    ) : (
                      <ul className="space-y-3">
                        {companyDetail.contacts.map((contact) => (
                          <li
                            key={contact.id}
                            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {contact.firstName} {contact.lastName}
                              </p>
                              {contact.jobTitle && (
                                <p className="text-sm text-slate-600">
                                  {contact.jobTitle}
                                </p>
                              )}
                              {(contact.email || contact.phone) && (
                                <p className="text-sm text-slate-500">
                                  {[contact.email, contact.phone]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => openEditContactForm(contact)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => setDeletingContact(contact)}
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900">
                      Linked Applications
                    </h3>

                    {companyDetail.applications.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        No applications are linked to this company yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {companyDetail.applications.map((application) => (
                          <li
                            key={application.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                          >
                            <span className="font-medium text-slate-900">
                              {application.position}
                            </span>
                            <StatusBadge status={application.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )
            )}
          </Modal>
        )}

        {contactFormOpen && viewingCompany && (
          <Modal
            title={editingContact ? "Update Contact" : "Add Contact"}
            description={`For ${viewingCompany.name}`}
            onClose={closeContactForm}
          >
            <form
              onSubmit={handleContactSubmit}
              className="space-y-4"
              noValidate
            >
              {contactFormError && <ErrorBanner message={contactFormError} />}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="firstName" label="First name" required>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={contactForm.firstName}
                    onChange={(event) =>
                      setContactForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="lastName" label="Last name" required>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={contactForm.lastName}
                    onChange={(event) =>
                      setContactForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className={fieldInputClassName}
                  />
                </FormField>
              </div>

              <FormField id="jobTitle" label="Job title">
                <input
                  id="jobTitle"
                  type="text"
                  value={contactForm.jobTitle}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      jobTitle: event.target.value,
                    }))
                  }
                  placeholder="Hiring Manager"
                  className={fieldInputClassName}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="email" label="Email">
                  <input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(event) =>
                      setContactForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="phone" label="Phone">
                  <input
                    id="phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(event) =>
                      setContactForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className={fieldInputClassName}
                  />
                </FormField>
              </div>

              <FormField id="contactNotes" label="Notes">
                <textarea
                  id="contactNotes"
                  rows={3}
                  value={contactForm.notes}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className={fieldInputClassName}
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeContactForm}
                  disabled={savingContact}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={savingContact}
                  loadingText="Saving..."
                >
                  {editingContact ? "Save Changes" : "Add Contact"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {deletingContact && (
          <ConfirmDialog
            title="Delete this contact?"
            description={`This will permanently remove ${deletingContact.firstName} ${deletingContact.lastName}.`}
            loading={deletingContactBusy}
            onConfirm={confirmDeleteContact}
            onCancel={() => setDeletingContact(null)}
          />
        )}
      </main>
    </div>
  );
}
