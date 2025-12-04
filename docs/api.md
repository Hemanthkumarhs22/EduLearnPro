# API Reference – Edu Learn Pro

Base URL: `http://localhost:8000/api/v1`

Authentication uses bearer tokens (JWT). Include `Authorization: Bearer <token>` for protected endpoints.

## Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new user account. Body: `full_name`, `email`, `password`, `role`, optional `bio`, `avatar_url`. |
| `POST` | `/auth/token` | Obtain JWT via OAuth2 password flow (`username`, `password` form fields). |
| `GET`  | `/auth/me` | Current user profile. |
| `POST` | `/auth/logout` | Placeholder for client-side logout acknowledgement. |

## Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/users/me` | Read authenticated profile. |
| `PUT`  | `/users/me` | Update `full_name`, `bio`, `avatar_url`. |
| `GET`  | `/users/me/dashboard` | Role-aware dashboard data. Returns `StudentDashboard` or `InstructorDashboard`. |

## Courses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/courses` | Catalog with optional query params: `search`, `category`, `level`, `status_filter`. | Public |
| `GET`  | `/courses/{course_id}` | Course details with lessons. | Public |
| `GET`  | `/courses/mine` | Courses owned by instructor. | Instructor/Admin |
| `POST` | `/courses` | Create course. | Instructor/Admin |
| `PUT`  | `/courses/{course_id}` | Update course. | Instructor owner/Admin |
| `DELETE` | `/courses/{course_id}` | Delete course. | Instructor owner/Admin |
| `POST` | `/courses/{course_id}/thumbnail` | Upload course thumbnail (`multipart/form-data` file). | Instructor owner/Admin |

## Lessons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/lessons/course/{course_id}` | List lessons ordered by `position`. | Authenticated |
| `POST` | `/lessons` | Create lesson (`course_id`, `title`, `content`, optional `video_url`, `position`). | Instructor owner/Admin |
| `PUT`  | `/lessons/{lesson_id}` | Update lesson. | Instructor owner/Admin |
| `DELETE` | `/lessons/{lesson_id}` | Delete lesson. | Instructor owner/Admin |

## Enrollments & Progress
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/enrollments` | Enroll current student in a published course (`course_id`). | Student/Admin |
| `GET`  | `/enrollments/me` | List current student enrollments. | Student/Admin |
| `GET`  | `/enrollments/course/{course_id}` | List enrollments for instructor-owned course. | Instructor owner/Admin |
| `POST` | `/enrollments/{enrollment_id}/progress` | Mark lesson completion (`lesson_id`, `is_completed`). Updates enrollment progress. | Student owner/Admin |
| `GET`  | `/enrollments/{enrollment_id}/progress` | Lesson-level progress for an enrollment. | Student owner/Instructor owner/Admin |
| `GET`  | `/enrollments/{enrollment_id}/certificate` | Returns certificate metadata once progress reaches 100% and status is `completed`. | Student owner/Instructor owner/Admin |

## Response Schemas
- `UserRead`, `ProfileRead`, `ProfileUpdate`
- `CourseSummary`, `CourseRead`, `CourseDetail`, `CourseCreate`, `CourseUpdate`
- `LessonRead`, `LessonCreate`, `LessonUpdate`
- `EnrollmentRead`, `ProgressUpdate`, `LessonProgressRead`, `CertificateRead`
- `StudentDashboard`, `InstructorDashboard`

Refer to `backend/app/schemas/` for detailed field definitions.

