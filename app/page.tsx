"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";
import ApplicationCard from "@/components/ApplicationCard";
import { mapApplication, mapCompany } from "@/lib/mappers";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationRecord,
  type CompanyRecord,
  type CompanyWithCounts,
} from "@/lib/types";

const statusAccent: Record<string, string> = {
  Applied: "border-blue-200",
  Interview: "border-yellow-200",
  Offer: "border-green-200",
  Rejected: "border-red-200",
};

export default function DashboardPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (!applicationsResponse.ok || !companiesResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const applicationsData: { applications: ApplicationRecord[] } =
          await applicationsResponse.json();
        const companiesData: { companies: CompanyRecord[] } =
          await companiesResponse.json();

        setApplications(applicationsData.applications.map(mapApplication));
        setCompanies(companiesData.companies.map(mapCompany));
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    for (const application of applications) {
      counts[application.status] += 1;
    }

    return counts;
  }, [applications]);

  const recentApplications = useMemo(
    () => applications.slice(0, 3),
    [applications],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Job application tracker"
          title="Dashboard"
          description="A snapshot of your job search: where you stand, and what's next."
          action={<Button href="/applications">Add Application</Button>}
        />

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <LoadingState label="Loading your dashboard..." />
        ) : (
          <>
            <section aria-labelledby="stats-heading" className="mb-8">
              <h2 id="stats-heading" className="sr-only">
                Application statistics
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">
                    Total Applications
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {applications.length}
                  </p>
                </div>

                {APPLICATION_STATUSES.map((status) => (
                  <div
                    key={status}
                    className={`rounded-xl border-2 bg-white p-5 shadow-sm ${statusAccent[status]}`}
                  >
                    <p className="text-sm font-medium text-slate-600">
                      {status}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {statusCounts[status]}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="companies-summary-heading"
              className="mb-8"
            >
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2
                  id="companies-summary-heading"
                  className="text-lg font-semibold text-slate-900"
                >
                  Companies you&apos;re tracking
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {companies.length} compan
                  {companies.length === 1 ? "y" : "ies"} with{" "}
                  {companies.reduce(
                    (total, company) => total + company.contactCount,
                    0,
                  )}{" "}
                  total contact
                  {companies.reduce(
                    (total, company) => total + company.contactCount,
                    0,
                  ) === 1
                    ? ""
                    : "s"}
                </p>
                <Link
                  href="/companies"
                  className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
                >
                  Manage companies →
                </Link>
              </div>
            </section>

            <section aria-labelledby="recent-heading">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="recent-heading" className="text-2xl font-semibold">
                  Recent Applications
                </h2>

                <Link
                  href="/applications"
                  className="text-sm font-semibold text-blue-700 hover:underline"
                >
                  View all →
                </Link>
              </div>

              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Start tracking your job search by adding your first application."
                  action={<Button href="/applications">Add Application</Button>}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      compact
                      onView={() => router.push("/applications")}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
