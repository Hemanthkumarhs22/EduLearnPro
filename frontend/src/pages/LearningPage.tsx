import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import type { Course, Enrollment, Lesson, LessonProgress } from "../types";
import LessonList from "../components/LessonList";
import ProgressBar from "../components/ProgressBar";
import { Icon } from "../components/Icon";

// Inline certificate component (no separate file)
const CertificateBlock = ({
  courseTitle,
  studentName,
  date,
  certificateId,
}: {
  courseTitle: string;
  studentName: string;
  date: string;
  certificateId: string;
}) => {
  return (
    <div className="mt-8 mx-auto max-w-4xl bg-white rounded-2xl shadow-card border border-primary-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
            <Icon name="school" className="text-3xl text-primary-700" />
          </div>
          <div>
            <div className="text-primary-700 font-semibold">EduLearnPro</div>
            <div className="text-xs text-gray-500">Certificate of Completion</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Certificate ID</div>
          <div className="font-mono text-sm text-gray-700">{certificateId}</div>
        </div>
      </div>

      {/* Body */}
      <div className="text-center border-t border-b py-10 border-primary-50">
        <h2 className="text-3xl font-heading font-bold text-primary-800">
          Certificate of Completion
        </h2>

        <p className="mt-4 text-gray-700">This is to certify that</p>

        <div className="mt-4 text-2xl font-heading font-semibold text-gray-900">
          {studentName}
        </div>

        <p className="mt-2 text-sm text-gray-600">has successfully completed the course</p>

        <div className="mt-3 text-xl font-semibold text-primary-700">{courseTitle}</div>

        <div className="mt-6 text-sm text-gray-600">Issued on {date}</div>
      </div>

      {/* Signatures + Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div className="w-28 h-10 border-t border-gray-300"></div>
            <div className="mt-2 text-sm text-gray-600">Instructor</div>
          </div>

          <div className="text-center">
            <div className="w-28 h-10 border-t border-gray-300"></div>
            <div className="mt-2 text-sm text-gray-600">Director</div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700"
        >
          <Icon name="print" />
          Print
        </button>
      </div>
    </div>
  );
};

async function fetchCourse(courseId: string) {
  const { data } = await api.get<Course>(`/courses/${courseId}`);
  return data;
}

async function fetchEnrollments() {
  const { data } = await api.get<Enrollment[]>("/enrollments/me");
  return data;
}

async function fetchProgress(enrollmentId: string) {
  const { data } = await api.get<LessonProgress[]>(`/enrollments/${enrollmentId}/progress`);
  return data;
}

export default function LearningPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
    enabled: Boolean(courseId),
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: fetchEnrollments,
  });

  const course = courseQuery.data;
  const enrollments = enrollmentsQuery.data ?? [];
  const enrollment = enrollments.find((en) => en.course_id === courseId);

  const { data: progress = [] } = useQuery({
    queryKey: ["progress", enrollment?.id],
    queryFn: () => fetchProgress(enrollment!.id),
    enabled: Boolean(enrollment?.id),
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (course?.lessons?.length) {
      setActiveLesson(course.lessons[0]);
    }
  }, [course]);

  const progressMap = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    progress?.forEach((item) => map.set(item.lesson_id, item));
    return map;
  }, [progress]);

  // Check if a lesson can be marked as complete (all previous lessons must be completed)
  const canMarkComplete = useMemo(() => {
    if (!activeLesson || !course?.lessons) return true;

    // Sort lessons by position
    const sortedLessons = [...course.lessons].sort((a, b) => a.position - b.position);
    const currentIndex = sortedLessons.findIndex((l) => l.id === activeLesson.id);

    // Check if all previous lessons are completed
    for (let i = 0; i < currentIndex; i++) {
      const prevLesson = sortedLessons[i];
      const prevProgress = progressMap.get(prevLesson.id);
      if (!prevProgress || !prevProgress.is_completed) {
        return false;
      }
    }

    return true;
  }, [activeLesson, course?.lessons, progressMap]);

  // Get the first incomplete previous lesson for error message
  const firstIncompleteLesson = useMemo(() => {
    if (!activeLesson || !course?.lessons || canMarkComplete) return null;

    const sortedLessons = [...course.lessons].sort((a, b) => a.position - b.position);
    const currentIndex = sortedLessons.findIndex((l) => l.id === activeLesson.id);

    for (let i = 0; i < currentIndex; i++) {
      const prevLesson = sortedLessons[i];
      const prevProgress = progressMap.get(prevLesson.id);
      if (!prevProgress || !prevProgress.is_completed) {
        return prevLesson;
      }
    }

    return null;
  }, [activeLesson, course?.lessons, progressMap, canMarkComplete]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressMutation = useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string; completed: boolean }) => {
      if (!enrollment) return;
      setErrorMessage(null);
      try {
        await api.post(`/enrollments/${enrollment.id}/progress`, {
          lesson_id: lessonId,
          is_completed: completed,
        });
      } catch (error: any) {
        const message = error?.response?.data?.detail || "Failed to update progress. Please try again.";
        setErrorMessage(message);
        throw error;
      }
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      if (enrollment) {
        queryClient.invalidateQueries({ queryKey: ["progress", enrollment.id] });
        queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      }
    },
  });

  if (courseQuery.isLoading || enrollmentsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!course || !enrollment) {
    return <p className="text-center text-base-content/70">Enroll in this course to access the learning interface.</p>;
  }

  const completedLessons = progress?.filter((item) => item.is_completed).length ?? 0;
  const totalLessons = course.lessons?.length ?? 0;
  const completionPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <section className="space-y-6 rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-base-content">{course.title}</h1>
          <p className="text-sm text-base-content/70">Lesson {activeLesson?.position ?? 1} of {totalLessons}</p>
          <ProgressBar value={completionPercent} />
        </header>

        {/* Certificate (shown when course is completed) */}
        {completionPercent >= 100 && (
          <CertificateBlock
            courseTitle={course.title}
            studentName={"Student"} // replace with actual user name if available
            date={new Date().toLocaleDateString()}
            certificateId={`${course.id}-${Date.now()}`}
          />
        )}

        {activeLesson ? (
          <article className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-base-content">{activeLesson.title}</h2>
                <button
                  onClick={() =>
                    progressMutation.mutate({
                      lessonId: activeLesson.id,
                      completed: !progressMap.get(activeLesson.id)?.is_completed,
                    })
                  }
                  disabled={!canMarkComplete && !progressMap.get(activeLesson.id)?.is_completed}
                  className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                    progressMap.get(activeLesson.id)?.is_completed
                      ? "bg-primary text-primary-content shadow-md hover:shadow-lg"
                      : canMarkComplete
                      ? "bg-primary text-primary-content shadow-md hover:shadow-lg hover:scale-105"
                      : "bg-base-300 text-base-content/70 shadow-md cursor-not-allowed opacity-80"
                  }`}
                >
                  {progressMap.get(activeLesson.id)?.is_completed ? (
                    <>
                      <Icon name="check_circle" className="mr-2 text-base" /> Mark as incomplete
                    </>
                  ) : (
                    <>
                      <Icon name="check_circle" className="mr-2 text-base" /> Mark as complete
                    </>
                  )}
                </button>
              </div>
              {!canMarkComplete && !progressMap.get(activeLesson.id)?.is_completed && firstIncompleteLesson && (
                <div className="rounded-lg bg-warning/10 border-2 border-warning/30 p-3">
                  <p className="text-sm font-semibold text-warning">
                    <span className="inline-flex items-center gap-2">
                      <Icon name="warning" className="text-base" />
                      <span>
                        Please complete lesson {firstIncompleteLesson.position} ({firstIncompleteLesson.title}) first before
                        marking this lesson as complete.
                      </span>
                    </span>
                  </p>
                </div>
              )}
              {errorMessage && (
                <div className="rounded-lg bg-error/10 border-2 border-error/30 p-3">
                  <p className="text-sm font-semibold text-error">{errorMessage}</p>
                </div>
              )}
            </div>

            {activeLesson.thumbnail_url && (
              <div className="w-full overflow-hidden rounded-xl bg-base-300 shadow-lg">
                <img
                  src={activeLesson.thumbnail_url}
                  alt={activeLesson.title}
                  className="h-auto w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {activeLesson.video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-base-300 shadow-lg">
                <iframe
                  src={activeLesson.video_url}
                  title={activeLesson.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}

            <div className="prose max-w-none text-base-content">
              <p>{activeLesson.content}</p>
            </div>

            <div className="flex justify-between">
              <button
                disabled={!course.lessons || activeLesson.position === 1}
                onClick={() => {
                  const previous = course.lessons?.find((lesson) => lesson.position === activeLesson.position - 1);
                  if (previous) setActiveLesson(previous);
                }}
                className="rounded-lg border border-base-300 px-4 py-2 text-sm font-semibold text-base-content hover:bg-base-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={!course.lessons || activeLesson.position === totalLessons}
                onClick={() => {
                  const next = course.lessons?.find((lesson) => lesson.position === activeLesson.position + 1);
                  if (next) setActiveLesson(next);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary-focus disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </article>
        ) : (
          <p className="text-sm text-base-content/70">Select a lesson to start learning.</p>
        )}
      </section>

      <aside className="space-y-4 rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-base-content">Lessons</h2>
        <LessonList
          lessons={course.lessons ?? []}
          activeLessonId={activeLesson?.id}
          onSelect={(lesson) => setActiveLesson(lesson)}
          progressMap={progressMap}
        />
      </aside>
    </div>
  );
}
