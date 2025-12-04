# Database Schema – Edu Learn Pro

Relational database: **PostgreSQL**

## Entities & Relationships
- **users**
  - `id` (UUID, PK)
  - `full_name`, `email` (unique), `hashed_password`
  - `role` (`student`, `instructor`, `admin`)
  - Optional profile fields: `bio`, `avatar_url`
  - Timestamps: `created_at`, `updated_at`
  - Relationships:
    - `owned_courses` (1-to-many with `courses`)
    - `enrollments` (1-to-many with `enrollments`)

- **courses**
  - `id` (UUID, PK)
  - `title`, `description`, `category`
  - `level` (`beginner`, `intermediate`, `advanced`)
  - `status` (`draft`, `published`)
  - Optional `thumbnail_url`
  - `instructor_id` → `users.id`
  - `lessons` (1-to-many with `lessons`, ordered by `position`)
  - `enrollments` (1-to-many with `enrollments`)

- **lessons**
  - `id` (UUID, PK)
  - `course_id` → `courses.id`
  - `title`, `content`, optional `video_url`
  - `position` (integer ordering)
  - Timestamps
  - `progresses` (1-to-many with `lesson_progress`)

- **enrollments**
  - `id` (UUID, PK)
  - `student_id` → `users.id`
  - `course_id` → `courses.id`
  - Unique constraint on `(student_id, course_id)`
  - `status` (`active`, `completed`, `cancelled`)
  - `progress_percent` (float)
  - Timestamps
  - Relationships:
    - `lesson_progress` (1-to-many with `lesson_progress`)

- **lesson_progress**
  - `id` (UUID, PK)
  - `enrollment_id` → `enrollments.id`
  - `lesson_id` → `lessons.id`
  - `is_completed` (bool), `completed_at` (timestamp)
  - Unique constraint on `(enrollment_id, lesson_id)`

## ER Diagram (Textual)
```
users (1) ──< courses
users (1) ──< enrollments >── (1) courses
courses (1) ──< lessons
enrollments (1) ──< lesson_progress >── (1) lessons
```

## Indexing & Performance Notes
- `users.email`, `courses.title`, `enrollments.student_id`, `enrollments.course_id` indexed for lookup speed.
- Enum types stored as PostgreSQL enums for data integrity.
- Lesson ordering handled via integer `position`; adjust with transactions to maintain contiguous ordering.

## Migration Management
- Alembic revision `0001_initial_schema` creates all tables and enums.
- Run migrations with `alembic upgrade head`.
- Seed sample data using `python -m app.db.init_db`.

