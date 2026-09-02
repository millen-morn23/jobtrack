\# JobTrack Copilot Instructions



\## Project Overview



JobTrack is a web application that helps job seekers organize and track their job applications in one place.



The project is being completed as an approved individual project for WDD 430. Do not assume or invent teammates, team members, or team-owned responsibilities.



\## Technology Stack



\- Next.js 16.3.3

\- React 19.2.8

\- TypeScript

\- Tailwind CSS

\- Next.js App Router

\- PostgreSQL is the planned database

\- ESLint and Prettier for code quality and formatting



\## Project Structure



Use the following structure and conventions:



\- `app/` contains Next.js App Router pages, layouts, styles, and API routes.

\- `components/` is reserved for reusable UI components.

\- `lib/` is reserved for shared application logic, utilities, database access, and other reusable non-UI functionality.

\- `public/` contains static assets.

\- `.github/` contains GitHub-related project configuration and development instructions.

\- `.specify/` contains Spec-Kit project support files.

\- `specs/` contains project specifications and planning documentation.



Do not create unnecessary folders or duplicate functionality between directories.



\## Core Data Model



The planned core entities are:



\### User

\- `id` - primary key

\- User account information



\### Job Application

\- `id` - primary key

\- Job/application information

\- `userId` - foreign key to User

\- `companyId` - foreign key to Company

\- Application status



\### Company

\- `id` - primary key

\- Company information



\### Contact

\- `id` - primary key

\- Contact information

\- Associated with a Company



Applications should be associated with companies, and users should own their application data.



PostgreSQL is the planned database for persistent application data.



\## Application Statuses



The core application statuses are:



\- Applied

\- Interview

\- Offer

\- Rejected



Use these status names consistently throughout the application.



\## Core Features



The core JobTrack requirements are:



1\. Create job applications.

2\. View job applications.

3\. View application details.

4\. Update job applications.

5\. Delete job applications.

6\. Track application status.

7\. Display dashboard statistics.

8\. Manage companies and contacts.

9\. Associate applications with companies.

10\. Support application search and filtering.

11\. Eventually support user authentication and privacy.



Do not add unrelated features simply for the sake of adding functionality.



\## Coding Conventions



\### TypeScript



\- Use TypeScript for application code.

\- Prefer explicit types for component props, function parameters, and important data structures.

\- Avoid `any` unless there is a documented and necessary reason.

\- Keep types close to the functionality they describe unless they are shared across multiple parts of the application.



\### React



\- Use functional React components.

\- Use the Next.js App Router conventions.

\- Keep components focused on a single responsibility.

\- Extract reusable UI into `components/` when the same UI or behavior is needed in multiple places.

\- Keep page-specific functionality in the appropriate `app/` route.



\### Naming



\- Use PascalCase for React component names.

\- Use camelCase for variables, functions, and object properties.

\- Use descriptive names that communicate the purpose of the code.

\- Use consistent terminology from the JobTrack data model.



Examples:



\- `JobApplication`

\- `ApplicationStatus`

\- `CompanyCard`

\- `applicationStatus`

\- `companyId`

\- `handleApplicationUpdate`



\### Styling



\- Use Tailwind CSS for component and page styling where appropriate.

\- Keep styling consistent with the existing JobTrack design.

\- Maintain responsive layouts for desktop, tablet, and mobile screen sizes.

\- Avoid unnecessary custom CSS when an existing Tailwind solution is sufficient.



\## UI and Accessibility



JobTrack should use semantic HTML and accessible UI patterns.



\- Use appropriate headings and landmarks.

\- Use descriptive labels for form controls.

\- Use accessible button and link text.

\- Provide visible keyboard focus states.

\- Do not rely on color alone to communicate application status.

\- Maintain readable contrast.

\- Make layouts usable on smaller screens.

\- Use ARIA attributes only when they provide meaningful accessibility information.



Status colors should remain visually distinct while also being understandable through text or other non-color indicators.



\## Data and API Design



When backend persistence is implemented:



\- Keep database access separate from presentation components.

\- Validate incoming data.

\- Use clear API contracts.

\- Return appropriate HTTP status codes from API routes.

\- Do not expose sensitive user information.

\- Associate application records with the correct user.

\- Keep database logic reusable and organized under `lib/` or the established database-access structure.



Do not claim that data is persisted to PostgreSQL until the database integration has actually been implemented and tested.



\## Feature Development



When implementing a feature:



1\. Understand the existing code before changing it.

2\. Reuse existing functionality when possible.

3\. Keep changes focused on the requested feature.

4\. Preserve existing working functionality.

5\. Follow the established data model and naming conventions.

6\. Consider accessibility and responsive behavior.

7\. Run linting after making changes.

8\. Run the production build when appropriate.

9\. Do not introduce placeholder functionality that appears complete but does not actually work.



\## Git and Pull Requests



Use feature branches for feature development.



Feature work should:



\- Have a clear purpose.

\- Reference the appropriate GitHub issue when applicable.

\- Include meaningful implementation changes.

\- Be tested before opening a pull request.

\- Use clear commit messages.



Do not merge pull requests unless explicitly required by the project workflow.



\## Current Development Priorities



The current project is focused on building the core JobTrack application.



The current completed feature work includes the job application tracking interface.



Upcoming work includes:



\- Company and contact management

\- Application status tracking

\- Job application search and filtering

\- Dashboard functionality

\- Authentication

\- Testing and documentation



When asked what should be worked on next, prefer the existing GitHub issues and project specifications over inventing unrelated work.



\## Copilot Behavior



When suggesting code:



\- Follow these project decisions.

\- Inspect existing files before proposing duplicate functionality.

\- Do not invent project requirements.

\- Do not invent database fields that conflict with the established data model.

\- Do not introduce a different framework or architecture without a clear project requirement.

\- Clearly identify assumptions when a requirement has not yet been defined.

\- Prefer small, maintainable changes over unnecessary complexity.

\- Preserve existing functionality unless the requested change requires modifying it.



When uncertain about a project decision, ask for clarification rather than silently changing the architecture.

