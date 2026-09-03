# JobTrack

JobTrack is a web application that helps job seekers organize their job search: tracking applications through the hiring pipeline, and managing the companies and contacts behind those applications.

## Purpose & Problem Being Solved

Job searching generates a lot of scattered information — spreadsheets, notes apps, email threads — that's easy to lose track of. JobTrack gives a job seeker one authenticated, database-backed place to see every application, its current status, and the company/contact context behind it, without needing a spreadsheet.

## Target Users

Individual job seekers who are actively applying to multiple positions and want a lightweight system (not a full CRM) to track applications, companies, and recruiter/hiring-manager contacts.

## Main Features

- Email/password authentication (registration, login, logout) via Better Auth
- Protected, per-user dashboard, applications, and companies views
- Job application CRUD with status tracking (Applied, Interview, Offer, Rejected)
- Search and filter applications by company name, position, and status
- Company CRUD (name, website, industry, location, notes)
- Contact CRUD, scoped to a company (name, job title, email, phone, notes)
- Applications can optionally link to a tracked company
- Dashboard statistics (totals by status, company/contact counts, recent applications)
- All data is scoped to the authenticated user and stored in PostgreSQL

## Project Structure

This is an approved **individual** project for BYU-Idaho WDD 430.

- **Millen Morn** — sole project member

## Technology Stack

- [Next.js](https://nextjs.org/) (App Router) 16
- [React](https://react.dev/) 19 / TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Better Auth](https://www.better-auth.com/) (email/password authentication)
- [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) and the [`pg`](https://node-postgres.com/) driver
- ESLint + Prettier
- [Vercel](https://vercel.com/) (deployment)

## Local Setup

### Prerequisites

- Node.js 20+ (this project was built/tested on Node 24, which can run the `.ts` scripts directly)
- A PostgreSQL database (a free [Neon](https://neon.tech/) project works well)

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root (never commit this file) with:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by the app and Better Auth |
| `BETTER_AUTH_SECRET` | Random secret used by Better Auth to sign sessions |
| `BETTER_AUTH_URL` | Base URL of the app, e.g. `http://localhost:3000` in development |

If you provision the database through Vercel's Neon integration, `vercel env pull .env.local` will populate these (and a few extra Postgres/Vercel variables that aren't required by the app itself).

### Database Setup

Run the migrations (safe to re-run; every statement is `IF NOT EXISTS` / idempotent):

```bash
npm run db:migrate
```

This runs every `.sql` file in `lib/db/` in order:

1. `001_create_applications.sql` — `job_application` table
2. `002_create_companies.sql` — `company` table
3. `003_create_contacts.sql` — `contact` table
4. `004_add_company_id_to_job_application.sql` — links applications to companies

Better Auth manages its own tables (`user`, `session`, `account`, `verification`) automatically on first use.

You can sanity-check the `job_application` table's columns with:

```bash
npm run db:check
```

### Better Auth Setup

Better Auth is configured in `lib/auth.ts` with the `emailAndPassword` provider enabled, backed by the same PostgreSQL database via a `pg` `Pool`. No external OAuth provider setup is required. The client hooks live in `lib/auth-client.ts`, and the catch-all route handler that Better Auth needs is at `app/api/auth/[...all]/route.ts`.

### Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login` until you register an account.

## Deployment

The project is set up to deploy on [Vercel](https://vercel.com/) (a `.vercel` project link is already present). To deploy:

1. Push the branch/PR and connect the repository to a Vercel project (or use the existing linked project).
2. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (pointing at the deployed domain) as environment variables in the Vercel project settings.
3. Run `npm run db:migrate` against the production database (or via a Vercel deploy hook) before first use.

Production deployment: https://jobtrack-brown.vercel.app/

## API Route Documentation

All routes below require an authenticated session (a Better Auth cookie) and are scoped to the requesting user; unauthenticated requests receive `401`, and requests for another user's data receive `404`.

### Applications — `/api/applications`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/applications` | List the current user's applications (with linked company name, if any) |
| `POST` | `/api/applications` | Create an application (`company`, `position` required; `location`, `status`, `notes`, `companyId` optional) |
| `PATCH` | `/api/applications/:id` | Update an application (same fields as create) |
| `DELETE` | `/api/applications/:id` | Delete an application |

`status` must be one of `Applied`, `Interview`, `Offer`, `Rejected`. If `companyId` is provided, the API verifies the company belongs to the requesting user before linking it.

### Companies — `/api/companies`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/companies` | List the current user's companies, with contact/application counts |
| `POST` | `/api/companies` | Create a company (`name` required; `website`, `industry`, `location`, `notes` optional) |
| `GET` | `/api/companies/:id` | Get a company with its contacts and linked applications |
| `PATCH` | `/api/companies/:id` | Update a company |
| `DELETE` | `/api/companies/:id` | Delete a company (cascades to its contacts; linked applications keep their company name but are unlinked) |

Company names must be unique per user (case-insensitive); duplicates return `409`.

### Contacts — `/api/contacts`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/contacts?companyId=` | List the current user's contacts, optionally filtered by company |
| `POST` | `/api/contacts` | Create a contact (`firstName`, `lastName`, `companyId` required; `jobTitle`, `email`, `phone`, `notes` optional) |
| `PATCH` | `/api/contacts/:id` | Update a contact (company association cannot be changed) |
| `DELETE` | `/api/contacts/:id` | Delete a contact |

## Authentication Behavior

- Registration and login are handled by Better Auth's email/password flow.
- `proxy.ts` (Next.js 16's replacement for `middleware.ts`) protects `/`, `/applications`, and `/companies`, redirecting unauthenticated visitors to `/login`.
- Every API route independently re-checks the session server-side (defense in depth — a proxy matcher change alone should never be the only thing protecting a route).
- Logging out clears the session and redirects to `/login`.

## Database Documentation

All application data lives in PostgreSQL. Tables (beyond Better Auth's own `user`/`session`/`account`/`verification`):

- **`job_application`** — `id`, `user_id`, `company`, `company_id` (nullable FK → `company`), `position`, `location`, `date_applied`, `status`, `notes`, `created_at`, `updated_at`
- **`company`** — `id`, `user_id`, `name`, `website`, `industry`, `location`, `notes`, `created_at`, `updated_at`
- **`contact`** — `id`, `user_id`, `company_id` (FK → `company`, cascade delete), `first_name`, `last_name`, `job_title`, `email`, `phone`, `notes`, `created_at`, `updated_at`

Every table has a `user_id` foreign key and every query is filtered by the authenticated user's ID, so one user can never read, update, or delete another user's rows.

## Known Issues

- Search and filtering on the Applications page are client-side over the authenticated user's already-loaded dataset. This is appropriate at the scale of a single job seeker's applications, but would need to move server-side (with pagination) for a very large dataset.
- There is no password reset / email verification flow — Better Auth is configured for email/password only.

## Future Opportunities

- Application status history/timeline (the data model was designed to allow this later)
- Email or calendar reminders for follow-ups
- CSV import/export of applications
- Richer company research fields (salary data, glassdoor-style notes)

## Development Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the project with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run db:migrate` | Run all pending database migrations |
| `npm run db:check` | Inspect the `job_application` table's columns |

## Testing / Verification

There is no automated test suite (not required for this project's scope). Verification performed during development:

- `npm run lint` and `npm run build` both pass cleanly.
- Manual end-to-end testing in a real browser covering: registration, login, logout, protected-route redirects, application/company/contact create-read-update-delete, status changes, search/filter (including no-results and cleared-filter states), company deletion cascading to contacts while preserving the application's company name, and cross-user data isolation (a second account cannot see or fetch the first account's companies/applications).
- Direct API checks confirming unauthenticated requests return `401` and cross-user requests return `404`.

Browser QA completed against the production build:

- Mobile Lighthouse: Performance 98, Accessibility 100, Best Practices 100, SEO 100.
- Desktop Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- CSS Overview contrast checks were reviewed and the identified text/background combinations passed WCAG AA contrast requirements.
- Responsive behavior was verified across Dashboard, Applications, and Companies at a mobile viewport.
- Production authentication and application/company/contact workflows were verified on the deployed site.
