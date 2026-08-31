# Phase 0 Research: Core JobTrack Application

**Purpose**: Resolve technical clarifications and evaluate design options
**Date**: 2026-08-31

## Research Questions & Findings

### 1. Database Solution Selection

**Question**: Which database is most appropriate for the JobTrack course project?

**Options Evaluated**:

| Option | Pros | Cons | Recommendation |
|--------|------|------|-----------------|
| **PostgreSQL** | Relational model perfect for user/app/company/contact schema; ACID compliance; production-ready; strong TypeScript support | Requires server setup/hosting; more complex for course project; adds DevOps complexity | Best for production, not ideal for course scope |
| **SQLite** | File-based, zero setup; perfect for development/testing; simple to deploy; sufficient for single-user course project | Limited concurrency (courses are single dev typically); no real server; limited scaling | ✅ **RECOMMENDED** for course project MVP |
| **MongoDB/Document DB** | Flexible schema; good for rapid iteration | Overkill for relational data model; job apps/companies are naturally relational; adds complexity | Not recommended for this domain |
| **Firebase/Supabase** | Zero backend setup; built-in auth; real-time updates | Vendor lock-in; less control; cost concerns; TypeScript support adequate but different patterns | Viable alternative if cloud preference |

**Decision**: Use **SQLite** for MVP implementation.

**Rationale**: 
- Course project scope doesn't require distributed database complexity
- SQLite provides sufficient performance for 10,000 applications per user with indexed queries
- Zero setup overhead enables faster development
- Data persistence is local and simple (single `.db` file)
- Perfect for learning full-stack development without DevOps concerns
- Can migrate to PostgreSQL later if needed

**Migration Path**: If project scales beyond course, migrate to PostgreSQL using database-agnostic query patterns with Prisma ORM (already industry standard for Next.js projects).

**Implementation**: Use Prisma ORM with SQLite provider. Prisma provides:
- Type-safe database access
- Automatic migrations
- Easy schema definition
- Excellent TypeScript integration
- Can swap to PostgreSQL with one configuration change

---

### 2. User Authentication Approach

**Question**: What authentication pattern is best for a Next.js course project?

**Evaluated Options**:

| Option | Approach | Recommendation |
|--------|----------|-----------------|
| **Session-based (cookies)** | Traditional approach; Next.js middleware verifies session | ✅ **RECOMMENDED** - Simple, secure by default, aligns with Next.js App Router patterns |
| **JWT tokens** | Stateless tokens stored in localStorage | Not recommended - localStorage vulnerable to XSS; adds token refresh complexity |
| **Auth library (NextAuth.js)** | Full auth solution with multiple providers | Overkill for course MVP; adds dependency; email/password simpler to learn |

**Decision**: Session-based authentication using Next.js middleware.

**Rationale**:
- Simpler to understand and implement for learning
- More secure than JWT in browser storage
- Built into Next.js patterns
- Sufficient for course project (no OAuth/SSO required)
- Uses secure HTTP-only cookies

**Implementation Details**:
- Password hashing: `bcryptjs` (industry standard, easy to use)
- Session store: Consider server-side session storage with database or file-based session store (Prisma can manage)
- Middleware: Use Next.js middleware.ts to protect routes
- Cookie strategy: HTTP-only, Secure, SameSite=Strict

---

### 3. UI Component & Styling Approach

**Question**: How to implement Tailwind CSS components efficiently with TypeScript?

**Findings**:
- Tailwind CSS 4 is already in project dependencies
- Recommended patterns:
  1. **Component Library Approach**: Create reusable components in `/components/common` with Tailwind classes
  2. **Utility Classes Direct**: Use Tailwind classes directly in JSX (class names can be extracted to component-level constants)
  3. **CSS Modules**: Not recommended with Tailwind; CSS classes in Tailwind more flexible

**Decision**: Create reusable component library with Tailwind utility classes.

**Implementation**:
- Build `/components/common` with atomic components: Button, Input, Modal, Badge, etc.
- Use TypeScript interfaces for props with explicit types
- Document component usage in Storybook or JSDoc comments
- Leverage Tailwind's responsive prefixes and dark mode if needed

---

### 4. Testing Strategy

**Question**: What testing approach is most practical for a course project?

**Strategy**:
- **Unit Tests** (70% target): Test individual components, hooks, utility functions
- **Integration Tests** (15% target): Test feature workflows (auth flow, CRUD operations)
- **E2E Tests** (15% target): Critical user paths (login → add application → view dashboard)

**Tools**:
- Jest + React Testing Library (standard for Next.js, already familiar in React ecosystem)
- Playwright for E2E tests (simpler than Cypress for course projects)

**Coverage Targets**:
- Aim for 70% overall coverage (SC-043)
- 100% coverage for auth (security-critical)
- 80%+ coverage for core business logic (applications, companies)
- 50%+ coverage for UI components (harder to achieve 100% for UI)

---

### 5. Error Handling & Validation

**Question**: How to handle errors and validation consistently?

**Approach**:
- **Server-Side Validation**: All inputs validated on backend before database operations
- **Client-Side Validation**: Show immediate feedback (HTML5 + custom validation)
- **Error Messages**: User-friendly without exposing internal details
- **Error Logging**: Log errors for debugging (not in error messages to users)

**Implementation**:
- Use Zod or ts-pattern for schema validation (TypeScript-first)
- Middleware for global error handling in API routes
- Custom error component for user-facing error messages
- Never expose stack traces or internal details to users (SC-024)

---

### 6. Data Isolation & Authorization

**Question**: How to ensure users can only access their own data?

**Approach**:
- **Session-based User Context**: Every request includes authenticated user ID
- **Query Filtering**: All database queries filter by `userId` at ORM level
- **API Authorization**: Check user ownership before returning/modifying data
- **Middleware Protection**: Route-level middleware ensures authentication before access

**Implementation**:
- Store `userId` in session after login
- Every Prisma query includes `.where({ userId: currentUserId })`
- API routes check ownership before operations
- No user data in URLs (SC-024)

---

## Architecture Decisions Summary

| Decision | Choice | Evidence |
|----------|--------|----------|
| Database | SQLite with Prisma ORM | Perfect for course scope, zero setup, type-safe, easy migration |
| Authentication | Session-based with cookies + bcryptjs | Simpler than JWT, more secure, aligns with Next.js patterns |
| Components | Tailwind CSS utility classes + reusable component library | Already in project, efficient, type-safe |
| Testing | Jest + React Testing Library + Playwright | Industry standard for Next.js, achieves 70% coverage target |
| Validation | Zod schema validation + middleware | Type-safe, DRY, server-side security |
| Authorization | Session user context + per-query filtering | Simple, secure, effective for single-user apps |

## Next Steps (Phase 1)

With database and auth decisions finalized:
1. Create detailed data model (data-model.md) with Prisma schema entities
2. Document API contracts (contracts/) for all endpoints
3. Create quickstart guide for developers

All NEEDS CLARIFICATION items are now resolved. Proceed to Phase 1 design.
