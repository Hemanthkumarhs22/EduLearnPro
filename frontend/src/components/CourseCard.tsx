import { Link } from "react-router-dom";
import type { Course } from "../types";
import { Icon } from "./Icon";

interface CourseCardProps {
  course: Course;
  showManageActions?: boolean;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

const levelColors: Record<string, string> = {
  beginner: "from-primary to-primary",
  intermediate: "from-primary to-primary",
  advanced: "from-primary to-primary",
};

export default function CourseCard({ course, showManageActions, onEdit, onDelete }: CourseCardProps) {
  const levelGradient = levelColors[course.level] || "from-primary to-primary";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-base-300 bg-base-200 p-6 shadow-lg transition-all duration-300 hover-lift">
      <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-white animate-pulse-slow">
                <Icon name="menu_book" className="text-3xl text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-primary">{course.category}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full bg-gradient-to-r ${levelGradient} px-3 py-1 text-xs font-bold text-primary-content shadow-md capitalize animate-pulse-slow`}>
                {course.level}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize shadow-md ${
                  course.status === "published"
                    ? "bg-primary text-primary-content"
                    : "bg-base-300 text-base-content"
                }`}
              >
                {course.status}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm text-base-content/70 leading-relaxed">{course.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-base-300 pt-4">
          <span className="text-sm font-semibold text-base-content/70">
            <Icon name="group" className="mr-1 text-base" /> {course.enrollment_count ?? 0} enrolled
          </span>
          <Link
            to={`/catalog/${course.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-content shadow-md transition-all hover:scale-110 hover:shadow-lg hover:rotate-1"
          >
            View details →
          </Link>
        </div>
        {showManageActions && (
          <div className="mt-4 flex gap-3 border-t border-base-300 pt-4">
            <button
              onClick={() => onEdit?.(course)}
              className="flex-1 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-content shadow-md transition-all hover:scale-110 hover:shadow-lg"
            >
              <Icon name="edit" className="mr-2 text-base" /> Edit
            </button>
            <button
              onClick={() => onDelete?.(course)}
              className="flex-1 rounded-lg border-2 border-base-300 bg-base-300 px-4 py-2 text-sm font-bold text-base-content shadow-md transition-all hover:scale-110 hover:shadow-lg"
            >
              <Icon name="delete" className="mr-2 text-base" /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
