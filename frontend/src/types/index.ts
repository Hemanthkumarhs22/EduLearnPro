export type UserRole = "student" | "instructor" | "admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  bio?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  position: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  thumbnail_url?: string | null;
  instructor_id: string;
  lessons?: Lesson[];
  enrollment_count?: number;
}

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percent: number;
  created_at: string;
  updated_at?: string | null;
}

export interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface StudentDashboardData {
  enrolled_courses: number;
  completed_courses: number;
  total_lessons_completed: number;
  recent_activity: Array<{
    lesson_id: string;
    completed_at?: string | null;
  }>;
  progress_overview: Array<{
    enrollment_id: string;
    course_id: string;
    course_title: string;
    progress_percent: number;
    last_viewed?: string | null;
  }>;
}

export interface Certificate {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  student_id: string;
  student_name: string;
  issued_at: string;
  progress_percent: number;
}

export interface CourseAnalytics {
  course_id: string;
  title: string;
  enrollment_count: number;
  completion_rate: number;
}

export interface InstructorDashboardData {
  total_courses: number;
  total_students: number;
  average_completion_rate: number;
  courses: CourseAnalytics[];
}
