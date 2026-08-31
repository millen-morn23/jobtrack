# Phase 1 Design: Data Model

**Purpose**: Define the data structure and relationships for JobTrack
**Date**: 2026-08-31
**Database**: SQLite with Prisma ORM (decided in research.md)

## Entity Relationship Diagram

```
User (1) ─── (many) JobApplication
User (1) ─── (many) Company
User (1) ─── (many) Contact
Company (1) ─── (many) Contact
Company (1) ─── (many) JobApplication (optional)
```

All relationships enforce user isolation: each entity has `userId` field that ties it to exactly one user.

---

## Data Entities

### User

Represents a job seeker account. Each user has isolated access to their applications, companies, and contacts.

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | Primary Key, unique | Unique identifier |
| `email` | String | Unique, indexed | Login identifier (unique per system) |
| `password` | String (hashed) | Required | Stored as bcrypt hash, never plain text |
| `firstName` | String (optional) | Max 100 chars | Profile information |
| `lastName` | String (optional) | Max 100 chars | Profile information |
| `createdAt` | DateTime | Auto-set, immutable | Account creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last profile update timestamp |

**Indexes**: `email` (for login lookups), composite index on `(email, createdAt)`

**Notes**:
- Password is bcrypt-hashed immediately on account creation/update
- Never store or log plain passwords
- Email is case-insensitive for login (normalize to lowercase)
- First/last name are optional to reduce friction on signup

### JobApplication

Represents a single job application tracked by a user.

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | Primary Key | Unique identifier |
| `userId` | UUID | Foreign Key → User, indexed | Ensures data isolation (user can only see own apps) |
| `companyId` | UUID (optional) | Foreign Key → Company | Links to company record if user created one |
| `positionTitle` | String | Required, max 200 chars | Job title (e.g., "Software Engineer") |
| `status` | Enum | Applied \| Interview \| Offer \| Rejected | Application workflow status |
| `appliedDate` | Date | Required | When the application was submitted |
| `notes` | String | Optional, max 1000 chars | User notes about application |
| `createdAt` | DateTime | Auto-set | When this record was created in JobTrack |
| `updatedAt` | DateTime | Auto-update | Last modification timestamp |

**Indexes**: 
- Foreign key: `userId` (find all apps for user)
- Composite: `(userId, status)` (dashboard query for counts by status)
- Composite: `(userId, appliedDate)` (sorting/filtering by date)

**Notes**:
- `companyId` is optional because users may track companies separately from applications
- `status` is enum (4 fixed values) to ensure data integrity
- `appliedDate` is separate from `createdAt` because user may log past applications
- Store dates as UTC; display in user's timezone (client-side conversion)

### Company

Represents a company the user is applying to or researching.

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | Primary Key | Unique identifier |
| `userId` | UUID | Foreign Key → User, indexed | Ensures data isolation |
| `name` | String | Required, max 200 chars, unique per user | Company name (e.g., "Acme Inc") |
| `website` | String | Optional, max 500 chars, URL format | Company website URL |
| `location` | String | Optional, max 200 chars | City/country (e.g., "San Francisco, CA") |
| `notes` | String | Optional, max 2000 chars | Research notes about company |
| `createdAt` | DateTime | Auto-set | When user added this company |
| `updatedAt` | DateTime | Auto-update | Last modification timestamp |

**Indexes**: 
- Foreign key: `userId`
- Composite: `(userId, name)` (company lookup + list)
- Note: `name` is unique per user, not globally (different users can create same company)

**Notes**:
- Company names are unique per user (prevent accidental duplicates), but duplicates across users are allowed
- Website should be validated as URL format (HTTP/HTTPS)
- Location is free-text (no geographic validation needed)

### Contact

Represents a person at a company (recruiter, hiring manager, connection, etc.).

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | Primary Key | Unique identifier |
| `userId` | UUID | Foreign Key → User, indexed | Ensures data isolation |
| `companyId` | UUID | Foreign Key → Company, indexed | Associated company (required) |
| `firstName` | String | Required, max 100 chars | Contact first name |
| `lastName` | String | Required, max 100 chars | Contact last name |
| `jobTitle` | String | Required, max 200 chars | Contact's job title at company |
| `email` | String | Optional, max 255 chars, email format | Contact email |
| `phone` | String | Optional, max 20 chars | Contact phone number |
| `notes` | String | Optional, max 1000 chars | Notes about this person/interaction |
| `createdAt` | DateTime | Auto-set | When user added this contact |
| `updatedAt` | DateTime | Auto-update | Last modification timestamp |

**Indexes**: 
- Foreign keys: `userId`, `companyId`
- Composite: `(userId, companyId)` (contacts for specific company)

**Notes**:
- Email and phone are optional (user may only know name/title)
- `jobTitle` is the contact's job at the company, not the application position
- Email format validation should happen client-side and server-side
- Full name in two fields (firstName, lastName) allows for flexible display

### Application Status History (Optional, Future Enhancement)

*Note: Not required for MVP. Included here for reference if phase 2 wants to track status changes.*

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique identifier |
| `applicationId` | UUID | Foreign Key → JobApplication |
| `oldStatus` | Enum | Previous status |
| `newStatus` | Enum | New status |
| `changedAt` | DateTime | When status changed |
| `notes` | String (optional) | Why the change (e.g., "Phone screening scheduled") |

**Not included in MVP** but schema is prepared for future timeline/history features.

---

## Prisma Schema (Implementation Reference)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  firstName String?
  lastName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  applications JobApplication[]
  companies    Company[]
  contacts     Contact[]

  @@index([email])
  @@map("users")
}

model JobApplication {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
  positionTitle String
  status        ApplicationStatus @default(APPLIED)
  appliedDate   DateTime
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([userId, status])
  @@index([userId, appliedDate])
  @@map("job_applications")
}

model Company {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  website       String?
  location      String?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  applications JobApplication[]
  contacts     Contact[]

  @@unique([userId, name])
  @@index([userId])
  @@map("companies")
}

model Contact {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  firstName String
  lastName  String
  jobTitle  String
  email     String?
  phone     String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, companyId])
  @@map("contacts")
}

enum ApplicationStatus {
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
}
```

---

## Data Validation Rules

### User
- Email: Valid email format, unique, case-insensitive
- Password: Minimum 8 characters (enforced on input)
- First/Last Name: Max 100 characters each, alphanumeric + spaces allowed

### JobApplication
- Position Title: Required, 1-200 characters
- Applied Date: Valid date, cannot be in future
- Status: Must be one of: APPLIED, INTERVIEW, OFFER, REJECTED
- Notes: Max 1000 characters

### Company
- Name: Required, 1-200 characters, unique per user
- Website: Valid URL format if provided (starts with http/https)
- Location: Max 200 characters
- Notes: Max 2000 characters

### Contact
- First Name: Required, 1-100 characters
- Last Name: Required, 1-100 characters
- Job Title: Required, 1-200 characters
- Email: Valid email format if provided
- Phone: Valid phone format if provided (international)
- Notes: Max 1000 characters

---

## Query Patterns (Common Operations)

### Fetch All User Applications (Dashboard)
```
GET /applications where userId = {currentUserId}
  with status count aggregation
  ordered by appliedDate DESC
```
**Expected time**: < 200ms (SC-036)

### Fetch Application Counts by Status (Dashboard)
```
SELECT status, COUNT(*) 
FROM job_applications 
WHERE userId = {currentUserId}
GROUP BY status
```
**Expected time**: < 500ms (SC-034)

### Update Application Status
```
UPDATE job_applications 
SET status = {newStatus}, updatedAt = NOW()
WHERE id = {applicationId} AND userId = {currentUserId}
```
**Validation**: Verify userId ownership before update (authorization check)

### Fetch Company with Contacts
```
GET company/{companyId}
  including all contacts where userId = {currentUserId}
  verify company.userId = {currentUserId}
```
**Validation**: Confirm user owns company before returning

### Cascade Delete on Company Deletion
```
DELETE from job_applications WHERE companyId = {companyId}
DELETE from contacts WHERE companyId = {companyId}
DELETE from companies WHERE id = {companyId} AND userId = {currentUserId}
```
**Note**: Prisma handles cascades via schema (onDelete: Cascade)

---

## Data Isolation & Security

**Core Principle**: Every entity has a `userId` field. Before any operation:
1. Verify user is authenticated (has session)
2. Check that requested entity's `userId` matches authenticated user's ID
3. Add `where: { userId: currentUserId }` filter to all queries

**Examples**:
- Cannot delete another user's application
- Cannot view another user's companies
- Cannot update another user's contact info
- Dashboard only shows current user's statistics

**Enforcement**: Apply at ORM level (Prisma) and API layer (route handlers) for defense-in-depth.

---

## Performance Considerations

### Indexes for Common Queries
- `userId` on all tables (required for data isolation filter)
- `(userId, status)` on JobApplication (dashboard count queries)
- `(userId, appliedDate)` on JobApplication (sorting/filtering by date)
- `(userId, companyId)` on Contact (finding contacts for company)
- `(userId, name)` on Company (unique constraint + lookups)

### Scalability (SC-035: Handle 10k applications per user)
- With proper indexes, SQLite can handle 10k rows per user efficiently
- Pagination on list views prevents loading all applications at once
- Aggregation queries (status counts) are O(n) but under 500ms threshold

### Future Optimization Opportunities
- Add `lastViewedAt` to track dashboard last viewed (avoid unnecessary recalculation)
- Cache application counts in memory (if real-time accuracy not needed)
- Archive old rejected/closed applications (future feature, out of scope)

---

## Migration Strategy

**Initial Setup**:
1. Run `prisma migrate dev --name init` to create database schema
2. Seed with test data (5 test users, ~20 test applications per user for performance testing)

**Future Migrations**:
- All schema changes through Prisma migrations
- Migrations are version-controlled and reversible
- Can test migrations before deployment

**Database Switching** (if needed):
- Change `datasource db { provider = "postgresql" }` in schema
- Run migrations against PostgreSQL
- No code changes required (Prisma handles SQL dialect differences)

