# Testing Strategy – Edu Learn Pro

The current release focuses on manual QA with linting support. Extend with automated tests as the platform evolves.

## Automated Checks
- **Frontend linting:** `pnpm --dir frontend lint`
- **Type safety:** TypeScript compiler runs as part of `pnpm --dir frontend build`
- **Backend formatting/type hints:** SQLAlchemy + FastAPI typing enforced via static typing; add `mypy`/`ruff` per team standards.

## Manual QA Checklist
### Authentication
- Register as student and instructor, verify role-specific redirects.
- Attempt duplicate registration (email already used).
- Login with valid/invalid credentials.
- Logout clears token and redirects to login.

### Profiles & Dashboards
- Update profile fields and confirm persistence.
- Student dashboard displays accurate counts and activity.
- Instructor dashboard metrics respond to enrollment/test data.

### Courses & Lessons (Instructor)
- Create course (draft + published states).
- Upload/update thumbnail via file and URL.
- Edit/delete course (ensure only owner can modify).
- Create, edit, delete lessons; respect ordering field.

### Catalog & Enrollment (Student)
- Search/filter catalog and open course detail.
- Enroll in published course; prevent duplicate enrollment or draft access.
- Access learning interface, mark lessons complete/incomplete, observe progress bar updates.
- Ensure progress syncs across dashboard and course detail page.

### Certificates & Analytics
- After completing all lessons, download certificate from student dashboard.
- Instructor dashboard reflects updated completion rates.

### Error Handling
- Verify friendly messages for empty states (no courses, no lessons, etc.).
- Ensure protected routes redirect appropriately when unauthenticated or unauthorized.

## Known Gaps & Next Steps
- No automated backend tests yet; add pytest suites for auth, course CRUD, and progress calculations.
- Add integration/E2E tests (Playwright/Cypress) for user flows.
- Replace text certificate downloads with PDF or branded templates.
- Expand analytics visualizations and caching as data scales.

