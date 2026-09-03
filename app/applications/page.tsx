"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import ApplicationCard from "@/components/ApplicationCard";
import { mapApplication, mapCompany } from "@/lib/mappers";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationRecord,
  type ApplicationStatus,
  type CompanyRecord,
  type CompanyWithCounts,
} from "@/lib/types";

type FormState = {
  company: string;
  companyId: string;
  position: string;
  location: string;
  status: ApplicationStatus;
  notes: string;
};

const emptyForm: FormState = {
  company: "",
  companyId: "",
  position: "",
  location: "",
  status: "Applied",
  notes: "",
};

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(
    "All",
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [deletingApplication, setDeletingApplication] =
    useState<Application | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setError("");

        const [applicationsResponse, companiesResponse] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/companies"),
        ]);

        if (
          applicationsResponse.status === 401 ||
          companiesResponse.status === 401
        ) {
          router.push("/login");
          return;
        }

        if (!applicationsResponse.ok) {
          throw new Error("Unable to load applications.");
        }

        const applicationsData: { applications: ApplicationRecord[] } =
          await applicationsResponse.json();
        setApplications(applicationsData.applications.map(mapApplication));

        if (companiesResponse.ok) {
          const companiesData: { companies: CompanyRecord[] } =
            await companiesResponse.json();
          setCompanies(companiesData.companies.map(mapCompany));
        }
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load your applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesTerm =
        term === "" ||
        application.company.toLowerCase().includes(term) ||
        application.position.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesTerm && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "All";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
  }

  function openCreateForm() {
    setEditingApplication(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(application: Application) {
    setEditingApplication(application);
    setForm({
      company: application.company,
      companyId: application.companyId ? String(application.companyId) : "",
      position: application.position,
      location: application.location,
      status: application.status,
      notes: application.notes,
    });
    setFormError("");
    setSelectedApplication(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingApplication(null);
    setForm(emptyForm);
    setFormError("");
  }

  function handleCompanySelect(companyId: string) {
    const company = companies.find((item) => String(item.id) === companyId);

    setForm((current) => ({
      ...current,
      companyId,
      company: company ? company.name : current.company,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.company.trim() || !form.position.trim()) {
      setFormError("Company and position are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setError("");

      const endpoint = editingApplication
        ? `/api/applications/${editingApplication.id}`
        : "/api/applications";

      const response = await fetch(endpoint, {
        method: editingApplication ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          companyId: form.companyId || null,
          position: form.position.trim(),
          location: form.location.trim(),
          status: form.status,
          notes: form.notes.trim(),
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save application.");
      }

      const savedApplication = mapApplication(data.application);

      setApplications((current) => {
        if (editingApplication) {
          return current.map((application) =>
            application.id === savedApplication.id
              ? savedApplication
              : application,
          );
        }
        return [savedApplication, ...current];
      });

      setSuccessMessage(
        editingApplication
          ? "Application updated successfully."
          : "Application added successfully.",
      );
      closeForm();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save application.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingApplication) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/applications/${deletingApplication.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete application.");
      }

      setApplications((current) =>
        current.filter(
          (application) => application.id !== deletingApplication.id,
        ),
      );
      setSuccessMessage("Application deleted successfully.");
      setSelectedApplication(null);
      setDeletingApplication(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete application.",
      );
      setDeletingApplication(null);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Job application tracker"
          title="Applications"
          description="Search, filter, and manage every job application you're tracking."
          action={
            <Button type="button" onClick={openCreateForm}>
              Add Application
            </Button>
          }
        />

        {error && <ErrorBanner message={error} />}
        {successMessage && <SuccessBanner message={successMessage} />}

        <section
          aria-label="Search and filter applications"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
        >
          <FormField id="search" label="Search" className="flex-1">
            <input
              id="search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by company or position"
              className={fieldInputClassName}
            />
          </FormField>

          <FormField id="status-filter" label="Status" className="sm:w-48">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ApplicationStatus | "All")
              }
              className={`${fieldInputClassName} bg-white`}
            >
              <option value="All">All statuses</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>

          {hasActiveFilters && (
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </section>

        <section aria-labelledby="applications-heading">
          <div className="mb-4">
            <h2 id="applications-heading" className="text-2xl font-semibold">
              {hasActiveFilters ? "Matching Applications" : "My Applications"}
            </h2>

            <p className="text-sm text-slate-600">
              {filteredApplications.length} of {applications.length} application
              {applications.length === 1 ? "" : "s"} shown
            </p>
          </div>

          {loading ? (
            <LoadingState label="Loading your applications..." />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Add your first job application to start tracking your search."
              action={<Button onClick={openCreateForm}>Add Application</Button>}
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title="No applications match your search"
              description="Try a different search term or clear your filters."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onView={setSelectedApplication}
                  onEdit={openEditForm}
                  onDelete={setDeletingApplication}
                />
              ))}
            </div>
          )}
        </section>

        {formOpen && (
          <Modal
            title={
              editingApplication
                ? "Update Job Application"
                : "Add Job Application"
            }
            description={
              editingApplication
                ? "Update the information for this application."
                : "Record a new application and its current status."
            }
            onClose={closeForm}
            className="max-w-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {formError && <ErrorBanner message={formError} />}

              {companies.length > 0 && (
                <FormField
                  id="companyId"
                  label="Link to existing company"
                  hint="Optional. Selecting a company fills in the name below."
                >
                  <select
                    id="companyId"
                    value={form.companyId}
                    onChange={(event) =>
                      handleCompanySelect(event.target.value)
                    }
                    className={`${fieldInputClassName} bg-white`}
                  >
                    <option value="">No company selected</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="company" label="Company" required>
                  <input
                    id="company"
                    type="text"
                    required
                    value={form.company}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    placeholder="Company name"
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="position" label="Position" required>
                  <input
                    id="position"
                    type="text"
                    required
                    value={form.position}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        position: event.target.value,
                      }))
                    }
                    placeholder="Job title"
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="location" label="Location">
                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    placeholder="Remote or city"
                    className={fieldInputClassName}
                  />
                </FormField>

                <FormField id="status" label="Status">
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as ApplicationStatus,
                      }))
                    }
                    className={`${fieldInputClassName} bg-white`}
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField id="notes" label="Notes">
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional notes"
                  className={fieldInputClassName}
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button type="submit" loading={saving} loadingText="Saving...">
                  {editingApplication ? "Save Changes" : "Add Application"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {selectedApplication && (
          <Modal
            title={selectedApplication.position}
            description={selectedApplication.company}
            onClose={() => setSelectedApplication(null)}
          >
            <div className="mb-4 flex justify-end">
              <StatusBadge status={selectedApplication.status} />
            </div>

            <dl className="space-y-3 border-y border-slate-200 py-5">
              <div className="flex justify-between gap-4">
                <dt className="font-medium">Company</dt>
                <dd className="text-right">{selectedApplication.company}</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="font-medium">Position</dt>
                <dd className="text-right">{selectedApplication.position}</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="font-medium">Location</dt>
                <dd className="text-right">
                  {selectedApplication.location || "Not specified"}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="font-medium">Date Applied</dt>
                <dd className="text-right">
                  {selectedApplication.dateApplied}
                </dd>
              </div>

              <div>
                <dt className="font-medium">Notes</dt>
                <dd className="mt-1 text-slate-600">
                  {selectedApplication.notes || "No notes added."}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => openEditForm(selectedApplication)}
              >
                Edit Application
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </div>
          </Modal>
        )}

        {deletingApplication && (
          <ConfirmDialog
            title="Delete this application?"
            description={`This will permanently remove your application for ${deletingApplication.position} at ${deletingApplication.company}.`}
            loading={deleting}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingApplication(null)}
          />
        )}
      </main>
    </div>
  );
}
