# Project Plan – Edu Learn Pro

The build followed a 16-day roadmap tailored to React + FastAPI + PostgreSQL. Each day targets a specific milestone; adjust timelines as needed.

## Phase 1 – Foundation & Setup (Days 1–4)
- **Day 1:** Confirm stack (React + Vite + Tailwind, FastAPI + SQLAlchemy, PostgreSQL). Draft architecture, plan auth & data flow.
- **Day 2:** Bootstrap repositories, configure pnpm workspace, initialize FastAPI project, add linting/prettier, create `.env` templates, smoke-test “Hello World”.
- **Day 3:** Design ERD (Users, Courses, Lessons, Enrollments, LessonProgress). Write Prisma-equivalent with SQLAlchemy models, generate Alembic migration, seed fixtures, verify async DB connectivity.
- **Day 4:** Organize route modules, dependency injection, and React routing skeleton. Enable CORS, static media, and shared layouts.

## Phase 2 – User Management (Days 5–7)
- **Day 5:** Implement registration/login endpoints, JWT issuance, password hashing, and matching React forms with validation feedback.
- **Day 6:** Build profile management, upload placeholders, and role-specific dashboards (student vs instructor).
- **Day 7:** Add auth middleware (`OAuth2PasswordBearer`), route guards, logout handling, and nav state awareness.

## Phase 3 – Course Management (Days 8–11)
- **Day 8:** Instructor CRUD for courses, thumbnail upload to `/media`, React management screen with optimistic updates.
- **Day 9:** Public catalog with search/filter, course detail page, enrollments API, and enrollment button workflow.
- **Day 10:** Lesson CRUD endpoints, ordering logic, React UI for creating and editing lessons.
- **Day 11:** Learning interface with prev/next navigation, lesson display, progress bar, “mark complete” toggle.

## Phase 4 – Progress & Analytics (Days 12–14)
- **Day 12:** Track lesson completion, update enrollment progress, expose progress overview, and generate completion certificates.
- **Day 13:** Instructor analytics (enrollment counts, completion rates) and student dashboard enhancements.
- **Day 14:** Responsive/UI polish, improved loading/error states, form validation, and accessibility pass.

## Phase 5 – Testing & Documentation (Days 15–16)
- **Day 15:** Manual QA across roles, verify uploads, double-check DB constraints, track issues, prepare lint/test scripts.
- **Day 16:** Author README, API/DB docs, user guide, testing notes, and presentation outline; final repository cleanup.

## Next Steps & Stretch Ideas
- Add richer analytics dashboards, quiz/assessment modules, and payment integrations.
- Introduce email verification, password reset flows, and background tasks (Celery/RQ).
- Build mobile experience (React Native/Flutter) and integrate push notifications.

