"use client";

import { FormEvent, useState } from "react";

type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";

type JobApplication = {
  id: number;
  company: string;
  position: string;
  location: string;
  dateApplied: string;
  status: ApplicationStatus;
  notes: string;
};

const initialApplications: JobApplication[] = [
  {
    id: 1,
    company: "Tech Solutions Inc.",
    position: "Frontend Developer",
    location: "Remote",
    dateApplied: "August 28, 2026",
    status: "Applied",
    notes: "Submitted application through the company careers page.",
  },
  {
    id: 2,
    company: "Creative Digital",
    position: "Full Stack Developer",
    location: "Nairobi, Kenya",
    dateApplied: "August 25, 2026",
    status: "Interview",
    notes: "First interview scheduled with the hiring team.",
  },
  {
    id: 3,
    company: "Innovate Labs",
    position: "Software Engineer",
    location: "Remote",
    dateApplied: "August 20, 2026",
    status: "Rejected",
    notes: "Application was not selected for the next stage.",
  },
];

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-100 text-blue-800",
  Interview: "bg-yellow-100 text-yellow-800",
  Offer: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function Home() {
  const [applications, setApplications] =
    useState<JobApplication[]>(initialApplications);

  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);

  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setCompany("");
    setPosition("");
    setLocation("");
    setStatus("Applied");
    setNotes("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company.trim() || !position.trim()) {
      return;
    }

    const newApplication: JobApplication = {
      id: Date.now(),
      company: company.trim(),
      position: position.trim(),
      location: location.trim() || "Not specified",
      dateApplied: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status,
      notes: notes.trim() || "No notes added.",
    };

    setApplications((currentApplications) => [
      newApplication,
      ...currentApplications,
    ]);

    resetForm();
  }

  function startEditing(application: JobApplication) {
    setEditingApplication(application);
    setCompany(application.company);
    setPosition(application.position);
    setLocation(application.location);
    setStatus(application.status);
    setNotes(application.notes);
    setSelectedApplication(null);
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingApplication || !company.trim() || !position.trim()) {
      return;
    }

    const updatedApplication: JobApplication = {
      ...editingApplication,
      company: company.trim(),
      position: position.trim(),
      location: location.trim() || "Not specified",
      status,
      notes: notes.trim() || "No notes added.",
    };

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === editingApplication.id
          ? updatedApplication
          : application,
      ),
    );

    setEditingApplication(null);
    resetForm();
  }

  function cancelEditing() {
    setEditingApplication(null);
    resetForm();
  }

  function handleDelete(id: number) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );

    setSelectedApplication(null);

    if (editingApplication?.id === id) {
      cancelEditing();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Job application tracker
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            JobTrack
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Keep your job applications organized and track where you are in
            the hiring process.
          </p>
        </header>

        <section
          aria-labelledby="application-form-heading"
          className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2
              id="application-form-heading"
              className="text-xl font-semibold"
            >
              {editingApplication
                ? "Update Job Application"
                : "Add Job Application"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {editingApplication
                ? "Update the information for this application."
                : "Record a new application and its current status."}
            </p>
          </div>

          <form
            onSubmit={editingApplication ? handleUpdate : handleSubmit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div>
              <label
                htmlFor="company"
                className="mb-1 block text-sm font-medium"
              >
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Company name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="mb-1 block text-sm font-medium"
              >
                Position
              </label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                placeholder="Job title"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Remote or city"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ApplicationStatus)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium"
              >
                Notes
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingApplication
                  ? "Save Changes"
                  : "Add Application"}
              </button>

              {editingApplication && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section aria-labelledby="applications-heading">
          <div className="mb-4">
            <h2 id="applications-heading" className="text-2xl font-semibold">
              My Applications
            </h2>
            <p className="text-sm text-slate-600">
              {applications.length} application
              {applications.length === 1 ? "" : "s"} tracked
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold">
                No applications yet
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Add your first job application using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {application.position}
                      </h3>
                      <p className="font-medium text-slate-700">
                        {application.company}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[application.status]}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <dl className="mb-5 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-800">
                        Location
                      </dt>
                      <dd className="text-right">
                        {application.location}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-800">
                        Date Applied
                      </dt>
                      <dd className="text-right">
                        {application.dateApplied}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApplication(application)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditing(application)}
                      className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(application.id)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedApplication && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            role="presentation"
            onClick={() => setSelectedApplication(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="details-heading"
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Application Details
                  </p>
                  <h2
                    id="details-heading"
                    className="mt-1 text-2xl font-bold"
                  >
                    {selectedApplication.position}
                  </h2>
                  <p className="text-slate-600">
                    {selectedApplication.company}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedApplication.status]}`}
                >
                  {selectedApplication.status}
                </span>
              </div>

              <dl className="space-y-3 border-y border-slate-200 py-5">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium">Company</dt>
                  <dd className="text-right">
                    {selectedApplication.company}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="font-medium">Position</dt>
                  <dd className="text-right">
                    {selectedApplication.position}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="font-medium">Location</dt>
                  <dd className="text-right">
                    {selectedApplication.location}
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
                    {selectedApplication.notes}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => startEditing(selectedApplication)}
                  className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Application
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}