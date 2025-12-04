import type { Lesson, LessonProgress } from "../types";
import { Icon } from "./Icon";

interface LessonListProps {
  lessons: Lesson[];
  activeLessonId?: string;
  onSelect: (lesson: Lesson) => void;
  progressMap?: Map<string, LessonProgress>;
}

export default function LessonList({ lessons, activeLessonId, onSelect, progressMap }: LessonListProps) {
  // Sort lessons by position
  const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);
  
  // Check if a lesson can be completed (all previous lessons must be completed)
  const canComplete = (lesson: Lesson): boolean => {
    if (!progressMap) return true;
    const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
    for (let i = 0; i < currentIndex; i++) {
      const prevLesson = sortedLessons[i];
      const prevProgress = progressMap.get(prevLesson.id);
      if (!prevProgress || !prevProgress.is_completed) {
        return false;
      }
    }
    return true;
  };

  return (
    <ul className="flex flex-col gap-3">
      {sortedLessons.map((lesson) => {
        const isActive = lesson.id === activeLessonId;
        const isCompleted = progressMap?.get(lesson.id)?.is_completed ?? false;
        const isLocked = !canComplete(lesson) && !isCompleted;
        
        return (
          <li key={lesson.id}>
            <button
              onClick={() => onSelect(lesson)}
              className={`w-full rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary/20 text-primary shadow-md"
                  : isLocked
                  ? "border-base-300 bg-base-300 text-base-content/70 cursor-pointer opacity-80"
                  : "border-base-300 bg-base-100 text-base-content hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                {lesson.thumbnail_url && (
                  <div className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-primary relative ${isLocked ? "opacity-50" : ""}`}>
                    <img
                      src={lesson.thumbnail_url}
                      alt={lesson.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        // Show error indicator
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="h-full w-full flex items-center justify-center text-xs text-red-500 font-semibold">Error</div>';
                        }
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm block truncate">
                      {lesson.position}. {lesson.title}
                    </span>
                    {isCompleted && (
                      <span className="text-primary text-sm inline-flex items-center">
                        <Icon name="check_circle" className="text-sm" />
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-base-content/70 text-xs inline-flex items-center">
                        <Icon name="lock" className="text-xs" />
                      </span>
                    )}
                  </div>
                  {lesson.thumbnail_url && !isLocked && (
                    <span className="text-xs text-base-content/70 mt-1 block">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="photo_camera" className="text-xs" />
                        <span>Has thumbnail</span>
                      </span>
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs text-base-content/70 mt-1 block">Complete previous lessons first</span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
