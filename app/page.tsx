export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-2xl bg-white p-8 shadow-sm sm:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            JobTrack
          </p>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Keep your job search organized.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Track applications, monitor interview progress, and keep important
            company and contact information in one place.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#applications"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              View Applications
            </a>

            <a
              href="#dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              View Dashboard
            </a>
          </div>
        </section>

        <section
          id="applications"
          className="mt-8 grid gap-6 sm:grid-cols-3"
          aria-label="JobTrack features"
        >
          <article className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Applications</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep track of the jobs you&apos;ve applied for and their current
              status.
            </p>
          </article>

          <article className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Get a quick view of interviews, offers, and other application
              activity.
            </p>
          </article>

          <article className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep company and contact information available while you search.
            </p>
          </article>
        </section>

        <section
          id="dashboard"
          className="mt-8 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Application Status</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Applied</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">0</p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Interview</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">0</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Offers</p>
              <p className="mt-1 text-2xl font-bold text-green-900">0</p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-red-900">0</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}