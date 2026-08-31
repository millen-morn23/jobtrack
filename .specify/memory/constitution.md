<!-- SYNC IMPACT REPORT: v1.0.0 (Initial Constitution)
  - New version: v1.0.0 (initial creation)
  - All 5 core principles defined
  - Development stack & security requirements sections added
  - Development workflow section added
  - Lightweight governance model established
  - Templates requiring updates: plan-template.md, spec-template.md, tasks-template.md
  - Status: ✅ Constitution complete
-->

# JobTrack Constitution

## Core Principles

### I. Type Safety & Maintainability
All code must prioritize TypeScript's type system for reliability and maintainability. Type annotations are not optional—every function parameter and return value must have explicit types. Avoid `any` types; use generics and union types instead. This ensures code is self-documenting, refactoring-safe, and catches errors at development time rather than runtime.

### II. User Experience & Accessibility
Every user-facing feature must be simple, intuitive, and accessible to all users regardless of ability. Follow WCAG 2.1 AA standards as a baseline. Interfaces should minimize cognitive load and support keyboard navigation. Test UI changes with real users when possible. Accessibility is not an afterthought—it's a requirement from day one.

### III. Security by Default
User data (job applications, contact info, authentication credentials) must be treated as sensitive. All authentication flows must be secure and properly validated. Secrets must never be committed to version control. API endpoints must validate all inputs and use appropriate authorization checks. Regular security reviews of auth flows and data handling are expected during feature implementation.

### IV. Component Modularity & Clear Separation
Code organization must follow Next.js App Router conventions with strict component boundaries. Shared UI components live in `/components`; utility functions in `/lib`; server-only logic in server actions. Components should be single-responsibility and reusable. Clear naming conventions and export structures make dependencies obvious and reduce accidental coupling.

### V. Testing & Documentation
Features are not complete without tests and documentation. Unit tests cover component logic and utility functions; integration tests verify critical user workflows (login, job application submission). README files and inline comments explain the "why" behind complex logic. Test coverage targets 70% minimum for new code. Broken tests block merges.

## Development Stack & Core Requirements

The technology foundation is fixed: Next.js 16+ (App Router), TypeScript 5+, React 19+, Tailwind CSS 4, and ESLint 9. These tools form the standard for all features. Do not introduce competing technologies (e.g., CSS-in-JS alternatives to Tailwind, state management libraries without team consensus, build tool replacements) without explicit constitution amendment. Deviations require documentation and team agreement.

## Development Workflow

1. **Planning**: Issues/PRs should reference principles violated or fulfilled. Design decisions affecting type safety, security, or accessibility must be documented.
2. **Code Review**: Reviewers verify TypeScript strictness, component modularity, test coverage, and accessibility compliance. Use ESLint and Prettier enforced pre-commit to maintain consistency.
3. **Testing & Merge**: All new code requires passing tests and documentation. Feature branches are deleted after merge; commit history should be clean and meaningful.
4. **Deployment**: Stable main branch always deployable. Breaking changes require a minor/major version bump and migration guide if needed.

## Governance

This constitution supersedes conflicting practices and applies to all contributions. Amendments may be proposed when core project needs change (new tech requirements, discovered security risks, team workflow improvements). Proposed amendments must be documented, justified, and reviewed before adoption. Version numbering follows semantic rules: MAJOR (breaking principle changes), MINOR (new principles or sections), PATCH (clarifications/wording).

All pull requests must verify alignment with principles. When complexity cannot be justified against these principles, it must be refactored before merge. This constitution is enforced during code review and is the reference for all development decisions.

**Version**: 1.0.0 | **Ratified**: 2026-08-31 | **Last Amended**: 2026-08-31
