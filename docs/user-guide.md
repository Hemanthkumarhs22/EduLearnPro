# User Guide – Edu Learn Pro

Edu Learn Pro serves two primary roles: **students** and **instructors** (with administrators holding both sets of permissions).

## Getting Started
1. Visit `http://localhost:5173`.
2. Create an account via **Sign Up** (choose student or instructor).
3. After registration or login, you are redirected to your role-specific dashboard.

## Common Features
- **Profile:** Update full name, bio, and avatar under `/profile`.
- **Navigation:** The top navigation shows Catalog, Dashboard, Profile, and Logout once authenticated.
- **Catalog:** Browse courses, search by title, filter by category/level, and view details.

## Student Experience
### Dashboard
- View overall stats (enrolled courses, completed courses, lessons completed).
- Review course progress list with quick links to continue learning.
- Download certificates for completed courses.
- Track recent activity for lesson completions.

### Enrolling & Learning
1. Browse the catalog and open a course detail page.
2. Click **Enroll in course** (only available for published courses).
3. Access the learning interface via **Continue learning** or `/learn/{courseId}`.
4. Mark lessons as complete to update progress; completion triggers certificate availability.

### Certificates
- Once progress reaches 100%, download a text-based certificate from the dashboard. Certificates include student name, course title, and completion timestamp.

## Instructor Experience
### Dashboard
- Monitor total courses, student counts, and average completion rate.
- Review per-course analytics (enrollment counts, completion rates).
- Quickly navigate to course management.

### Course Management
1. Create or edit courses with metadata (title, description, category, level, status).
2. Upload thumbnails (local files stored under `/media/thumbnails`).
3. Manage lessons (create, edit, delete, reorder via position field).
4. Preview courses as catalog visitors.

### Student Oversight
- View enrollments per course to understand student participation.
- Mark lessons as complete on behalf of students if necessary (via API tools).

## Administrator Notes
- Admins inherit instructor/student capabilities.
- Use for moderation tasks, manual adjustments, or support.

## Troubleshooting
- If API requests fail with 401, ensure you are logged in and the JWT token is stored in local storage (`edulearn_token`).
- Backend must be running on `http://localhost:8000`; adjust `VITE_API_URL` if using a different host/port.
- For database migrations, run `alembic upgrade head` and `python -m app.db.init_db`.

## Support & Feedback
- Use Git issues or project tracker to log bugs and feature requests.
- Consider expanding onboarding tips, adding progress streak visuals, or integrating richer analytics as future enhancements.

