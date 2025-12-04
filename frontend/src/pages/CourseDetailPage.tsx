import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import type { Course, Enrollment } from "../types";
import { useAuth } from "../hooks/useAuth";
import ProgressBar from "../components/ProgressBar";

async function fetchCourse(id: string) {
  const { data } = await api.get<Course>(`/courses/${id}`);
  return data;
}

async function fetchEnrollments() {
  const { data } = await api.get<Enrollment[]>("/enrollments/me");
  return data;
}

export default function CourseDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const queryClient = useQueryClient();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
    enabled: Boolean(courseId),
  });

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: fetchEnrollments,
    enabled: Boolean(user && user.role === "student"),
  });

  const enrollment = enrollments.find((en) => en.course_id === courseId);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await api.post<Enrollment>("/enrollments", { course_id: courseId });
    },
    onSuccess: () => {
      refetchEnrollments();
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  if (isLoading || !course) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const canEnroll = user?.role === "student" && !enrollment;

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-6 rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-base-content">{course.title}</h1>
          <p className="text-base-content/70">{course.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-primary/20 px-3 py-1 font-medium capitalize text-primary">
              {course.level}
            </span>
            <span className="rounded-full bg-base-300 px-3 py-1 text-base-content/70">{course.category}</span>
            <span className={`rounded-full px-3 py-1 capitalize ${course.status === "published" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
              {course.status}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-base-content">Lessons</h2>
          <ul className="space-y-2">
            {course.lessons?.map((lesson) => (
              <li key={lesson.id} className="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">
                <div className="font-medium text-base-content">
                  {lesson.position}. {lesson.title}
                </div>
                <p className="mt-1 line-clamp-2 text-base-content/70">{lesson.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-base-content">Course Actions</h3>
          {canEnroll ? (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-content hover:bg-primary-focus disabled:opacity-60"
            >
              {enrollMutation.isPending ? "Enrolling..." : "Enroll in course"}
            </button>
          ) : user?.role === "student" ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-base-content/70">You are enrolled in this course.</p>
              {enrollment && <ProgressBar value={enrollment.progress_percent} />}
            </div>
          ) : (
            <p className="mt-4 text-sm text-base-content/70">Sign in as a student to enroll.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
