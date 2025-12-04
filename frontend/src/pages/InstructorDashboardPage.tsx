import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { InstructorDashboardData } from "../types";
import StatsGrid from "../components/StatsGrid";

async function fetchInstructorDashboard() {
  const { data } = await api.get<InstructorDashboardData>("/users/me/dashboard");
  return data;
}

export default function InstructorDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["instructor-dashboard"], queryFn: fetchInstructorDashboard });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-base-content">Instructor Dashboard</h1>
        <p className="text-sm text-base-content/70">Manage your courses and monitor learner outcomes.</p>
        <div className="mt-4">
          <Link
            to="/instructor/courses"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-content transition hover:bg-primary-focus"
          >
            Manage Courses
          </Link>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: "Total Courses", value: data.total_courses },
          { label: "Total Students", value: data.total_students },
          { label: "Avg. Completion", value: `${data.average_completion_rate.toFixed(1)}%` },
          { label: "Top Course", value: data.courses[0]?.title ?? "—" },
        ]}
      />

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-base-content">Course Performance</h2>
        <div className="mt-4 space-y-4">
          {data.courses.length === 0 ? (
            <p className="text-sm text-base-content/70">Create your first course to see analytics.</p>
          ) : (
            data.courses.map((course) => (
              <div key={course.course_id} className="rounded-lg border border-base-300 p-4 bg-base-100">
                <div className="flex items-center justify-between text-sm text-base-content/70">
                  <span className="font-semibold text-base-content">{course.title}</span>
                  <span>{course.enrollment_count} learners</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-base-300">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(course.completion_rate, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-base-content/70">
                  Completion rate: {course.completion_rate.toFixed(1)}%
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
