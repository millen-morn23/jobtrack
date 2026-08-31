# Quickstart Guide: Core JobTrack Application

**Purpose**: Developer guide for implementing the core JobTrack feature
**Date**: 2026-08-31

This guide provides an overview of the implementation approach, key decisions, and steps to get started with development.

---

## Overview

**Feature**: Core JobTrack job application tracking system
**Framework**: Next.js 16 (App Router)
**Language**: TypeScript 5+
**Database**: SQLite with Prisma ORM
**Status**: Design phase complete; ready for implementation

**Key Design Decisions** (from research.md):
- ✅ SQLite for simplicity, perfect for course project
- ✅ Prisma ORM for type-safe database access
- ✅ Session-based auth with HTTP-only cookies
- ✅ bcryptjs for password hashing
- ✅ Next.js middleware for route protection

---

## Project Structure

### Directories (Next.js App Router)

```
app/                    # Route files + layouts
├── (auth)/             # Public auth routes (login, register)
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/              # Protected routes (requires auth)
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── applications/...
│   ├── companies/...
│   ├── contacts/...
│   └── profile/page.tsx
├── api/                # API route handlers
│   ├── auth/
│   ├── applications/
│   ├── companies/
│   └── contacts/
└── middleware.ts       # Auth middleware for protected routes

components/             # Reusable UI components
├── auth/               # Auth components
├── applications/       # Job application components
├── companies/          # Company components
├── contacts/           # Contact components
├── dashboard/          # Dashboard components
└── common/             # Shared components

lib/                    # Utilities & helpers
├── auth.ts             # Auth functions (hash, verify password)
├── db.ts               # Database client initialization
├── types.ts            # TypeScript type definitions
├── hooks/              # Custom React hooks
├── validations/        # Input validation schemas
└── utils/              # Utility functions

tests/                  # Test files (mirror src structure)
├── unit/
├── integration/
└── e2e/

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migration files
```

### Key Configuration Files

- `package.json`: Dependencies, scripts
- `tsconfig.json`: TypeScript configuration (strict mode enabled)
- `next.config.ts`: Next.js configuration
- `.env.local`: Environment variables (DATABASE_URL, session secret)
- `prisma/.env`: Prisma-specific env (DATABASE_URL)

---

## Getting Started: Implementation Steps

### Phase 1: Setup (Foundation)

1. **Install dependencies**
   ```bash
   npm install @prisma/client bcryptjs
   npm install -D prisma @types/node
   ```

2. **Initialize Prisma**
   ```bash
   npx prisma init
   ```
   - Creates `prisma/schema.prisma` and `.env` file

3. **Configure Database**
   - Set `DATABASE_URL` in `.env` to point to SQLite file
   - Example: `DATABASE_URL="file:./jobtrack.db"`

4. **Create Database Schema**
   - Copy Prisma schema from `data-model.md` to `prisma/schema.prisma`
   - Run migration: `npx prisma migrate dev --name init`

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Phase 2: Authentication (Security Foundation)

1. **Create auth utilities** (`lib/auth.ts`)
   - `hashPassword(password: string): Promise<string>`
   - `verifyPassword(password: string, hash: string): Promise<boolean>`
   - `createSession(userId: string): Promise<string>`
   - `validateSession(sessionId: string): Promise<User | null>`

2. **Create session middleware** (`app/middleware.ts`)
   - Extract session cookie from request
   - Verify session validity
   - Attach user ID to request context
   - Redirect unauthenticated users to /login

3. **Create auth routes**
   - `POST /api/auth/register` → Create user, hash password, create session
   - `POST /api/auth/login` → Verify credentials, create session
   - `POST /api/auth/logout` → Clear session cookie
   - `GET /api/auth/profile` → Return current user
   - `PUT /api/auth/profile` → Update user info
   - `POST /api/auth/change-password` → Change password

4. **Create auth pages**
   - `/register` → Registration form
   - `/login` → Login form
   - `/profile` → Profile management

### Phase 3: Job Applications (Core Feature - P1)

1. **Create application types** (`lib/types.ts`)
   - `JobApplication` interface matching Prisma schema
   - `ApplicationStatus` enum (APPLIED, INTERVIEW, OFFER, REJECTED)

2. **Create API endpoints** (`app/api/applications/`)
   - `GET /api/applications` → List with filters
   - `GET /api/applications/{id}` → Detail
   - `POST /api/applications` → Create
   - `PUT /api/applications/{id}` → Update
   - `DELETE /api/applications/{id}` → Delete
   - `GET /api/applications/dashboard/stats` → Counts by status

3. **Create components** (`components/applications/`)
   - `ApplicationList.tsx` → Table/list view
   - `ApplicationCard.tsx` → Card component
   - `ApplicationForm.tsx` → Create/edit form
   - `StatusBadge.tsx` → Status indicator

4. **Create pages** (`app/(app)/applications/`)
   - `/applications` → List page
   - `/applications/new` → Create page
   - `/applications/{id}` → Detail + edit page

5. **Create tests**
   - Unit tests for validation functions
   - Integration tests for CRUD operations
   - Component tests for UI rendering
   - Target: 70% coverage

### Phase 4: Dashboard (P2)

1. **Create dashboard components** (`components/dashboard/`)
   - `Dashboard.tsx` → Main dashboard
   - `StatCard.tsx` → Reusable stat card
   - `ApplicationFunnel.tsx` → Visualize application pipeline

2. **Implement dashboard calculations**
   - Query counts by status (optimized with indexes)
   - Display total, applied, interview, offer, rejected

3. **Create dashboard page** (`app/(app)/dashboard/page.tsx`)
   - Protected route showing user's statistics
   - Real-time updates when applications change

### Phase 5: Companies & Contacts (P3)

1. **Create API endpoints** (`app/api/companies/`, `app/api/contacts/`)
   - List, get, create, update, delete for each
   - Follow same authorization pattern as applications

2. **Create components** (`components/companies/`, `components/contacts/`)
   - Reusable components for display and forms

3. **Create pages** (`app/(app)/companies/`, `app/(app)/contacts/`)
   - List and detail pages for each

4. **Handle cascading deletes**
   - When company deleted: set applicationId to null, delete all contacts
   - When contact deleted: remove from company's contact list

---

## Development Checklist

### Essential for MVP

- [ ] Database schema created (Prisma)
- [ ] User authentication (register, login, logout)
- [ ] Session management with middleware
- [ ] Job application CRUD (all 4 operations)
- [ ] Dashboard with accurate counts
- [ ] Company management (CRUD)
- [ ] Contact management (CRUD)
- [ ] Data isolation (users only see own data)
- [ ] Input validation (server-side)
- [ ] Error handling & user feedback
- [ ] TypeScript strict mode (no `any` types)
- [ ] Responsive UI with Tailwind CSS
- [ ] Keyboard navigation accessible
- [ ] WCAG 2.1 AA color contrast
- [ ] Test coverage 70%+

### Testing Priorities

1. **Auth flow** (security-critical)
   - Registration with duplicate email
   - Login with wrong password
   - Session validation
   - Logout clears session

2. **Application CRUD** (core feature)
   - Create with required fields
   - Update status transitions
   - Delete removes from list
   - Dashboard reflects changes

3. **Data isolation** (security)
   - User A cannot see User B's applications
   - User A cannot delete User B's company
   - Queries filtered by userId

4. **Form validation** (UX)
   - Required fields enforced
   - Email format validated
   - Date validation (not future)
   - Error messages display

### Accessibility Checklist

- [ ] Keyboard navigation: Tab through all controls
- [ ] Form labels: Every input has associated label
- [ ] Error messages: Visible to screen readers
- [ ] Color contrast: 4.5:1 text, 3:1 graphics
- [ ] Loading states: User knows when waiting
- [ ] Confirmation dialogs: Delete actions confirmed

---

## Database Queries (Common Patterns)

### Count applications by status
```typescript
const counts = await prisma.jobApplication.groupBy({
  by: ['status'],
  where: { userId: currentUserId },
  _count: true,
});
// Returns: [{ status: 'APPLIED', _count: 8 }, ...]
```

### List applications with company info
```typescript
const apps = await prisma.jobApplication.findMany({
  where: { userId: currentUserId },
  include: { company: true },
  orderBy: { appliedDate: 'desc' },
  take: 50,
  skip: offset,
});
```

### Get company with contacts
```typescript
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: { contacts: true, applications: true },
});
// Verify: company.userId === currentUserId (authorization)
```

### Delete company (cascade)
```typescript
// Prisma handles cascades defined in schema:
await prisma.company.delete({
  where: { id: companyId },
  // Automatically deletes contacts, unlinks applications
});
```

---

## Performance Optimization

### Query Optimization
- Use indexes defined in data-model.md
- Paginate list results (avoid loading 10k rows at once)
- Use `select` to fetch only needed fields
- Cache dashboard stats if recalculation is expensive

### Frontend Optimization
- Lazy load components with React.lazy()
- Debounce search/filter inputs
- Virtualize long lists (if 1000+ items)
- Optimize images if any

### Database Optimization
- Run migrations in order
- Vacuum SQLite periodically (production)
- Consider query result caching (Redis, if needed)

---

## Deployment Checklist

**Before going to production**:

- [ ] All tests passing (70%+ coverage)
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passes
- [ ] ESLint clean
- [ ] Prettier formatting applied
- [ ] Secrets not in version control
- [ ] Database migrations in version control
- [ ] Environment variables documented
- [ ] Error handling covers edge cases
- [ ] Loading states show during async operations
- [ ] Accessibility tested with screen reader
- [ ] Performance meets targets (2s load, 500ms dashboard)

---

## Common Issues & Solutions

### Issue: "Cannot find module @prisma/client"
**Solution**: Run `npm install` and `npx prisma generate`

### Issue: "Database is locked" (SQLite)
**Solution**: Only one process can write to SQLite at a time. Ensure dev server not running when running tests.

### Issue: "Password does not match"
**Solution**: Use `await bcryptjs.compare()` not `===` for password verification

### Issue: User A sees User B's data
**Solution**: Verify all queries include `where: { userId: currentUserId }`. Add auth middleware check.

### Issue: Session not persisting between page reloads
**Solution**: Ensure session cookie is HTTP-only and Secure. Verify cookie is being set in response.

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Testing Library**: https://testing-library.com/react
- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref

---

## Success Criteria for Implementation

Feature is complete when:

1. ✅ All 47 success criteria passing (from spec.md)
2. ✅ All 32 functional requirements implemented
3. ✅ All 4 user story acceptance scenarios testable
4. ✅ Zero `any` TypeScript types (SC-038)
5. ✅ 70% test coverage (SC-043)
6. ✅ WCAG 2.1 AA accessible (SC-028)
7. ✅ 2-second page load (SC-033)
8. ✅ 500ms dashboard update (SC-034)
9. ✅ Zero unauthorized data access (SC-019)
10. ✅ User can complete workflow in <5 minutes (SC-030)

