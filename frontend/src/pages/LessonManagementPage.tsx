import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import type { Lesson } from "../types";
import { FormField } from "../components/FormField";
import LessonList from "../components/LessonList";
import { Icon } from "../components/Icon";

async function fetchLessons(courseId: string) {
  const { data } = await api.get<Lesson[]>(`/lessons/course/${courseId}`);
  return data;
}

export default function LessonManagementPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", video_url: "", thumbnail_url: "", position: 1 });
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => fetchLessons(courseId),
    enabled: Boolean(courseId),
  });

  const saveLesson = useMutation({
    mutationFn: async () => {
      const payload = { 
        ...formData, 
        course_id: courseId, 
        position: Number(formData.position),
        thumbnail_url: formData.thumbnail_url || null,
      };
      let lessonId: string;
      
      if (activeLesson) {
        await api.put(`/lessons/${activeLesson.id}`, payload);
        lessonId = activeLesson.id;
      } else {
        const { data } = await api.post<Lesson>("/lessons", payload);
        lessonId = data.id;
      }
      
      // Upload thumbnail file if provided
      if (thumbnailFile && lessonId) {
        const form = new FormData();
        form.append("file", thumbnailFile);
        await api.post(`/lessons/${lessonId}/thumbnail`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      return lessonId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      resetForm();
    },
    onError: () => setError("Unable to save lesson. Please try again."),
  });

  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      await api.delete(`/lessons/${lessonId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lessons", courseId] }),
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", video_url: "", thumbnail_url: "", position: lessons.length + 1 });
    setActiveLesson(null);
    setError(null);
    setThumbnailFile(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    await saveLesson.mutateAsync();
  };

  const handleSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      video_url: lesson.video_url ?? "",
      thumbnail_url: lesson.thumbnail_url ?? "",
      position: lesson.position,
    });
    setThumbnailFile(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-base-content">Lesson Management</h1>
          <p className="text-sm text-base-content/70">Organize your lesson content and maintain sequencing.</p>
        </div>
        <Link to="/instructor" className="text-sm text-primary hover:text-primary-focus">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-base-content">{activeLesson ? "Edit Lesson" : "Create Lesson"}</h2>
            {activeLesson && (
              <button onClick={resetForm} className="text-sm text-primary hover:text-primary-focus">
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <FormField label="Title" id="title" value={formData.title} onChange={(value) => setFormData((prev) => ({ ...prev, title: value }))} required />
            <FormField
              label="Content"
              id="content"
              value={formData.content}
              onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
              textarea
              required
            />
            <FormField
              label="Video URL"
              id="video_url"
              value={formData.video_url ?? ""}
              onChange={(value) => setFormData((prev) => ({ ...prev, video_url: value }))}
              placeholder="https://..."
            />
            <div className="md:col-span-2">
              <FormField
                label="Thumbnail URL"
                id="thumbnail_url"
                value={formData.thumbnail_url ?? ""}
                onChange={(value) => setFormData((prev) => ({ ...prev, thumbnail_url: value }))}
                placeholder="https://example.com/image.jpg (must be a direct image URL)"
              />
              {formData.thumbnail_url && (
                <div className="mt-3">
                  <p className="text-xs text-base-content/70 mb-2">Preview:</p>
                  <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border-2 border-base-300 bg-base-100">
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) {
                          errorDiv.style.display = "flex";
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) {
                          errorDiv.style.display = "none";
                        }
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-error/10 border-2 border-error/30 rounded-lg">
                      <div className="text-center p-4">
                        <p className="text-sm font-semibold text-error mb-1">
                          <span className="inline-flex items-center gap-2">
                            <Icon name="warning" className="text-base" />
                            <span>Image failed to load</span>
                          </span>
                        </p>
                        <p className="text-xs text-error/80">Make sure the URL is a direct link to an image file (.jpg, .png, etc.)</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-base-content/70 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="lightbulb" className="text-sm" />
                      <span>Tip: Use direct image URLs (ending in .jpg, .png, .webp, etc.), not page URLs</span>
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-base-content">
                <span>Or upload a thumbnail from your PC:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      if (activeLesson) {
                        // For existing lessons, upload immediately
                        const form = new FormData();
                        form.append("file", file);
                        api.post(`/lessons/${activeLesson.id}/thumbnail`, form, {
                          headers: { "Content-Type": "multipart/form-data" },
                        }).then(() => {
                          queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
                        });
                      } else {
                        // For new lessons, store file to upload after creation
                        setThumbnailFile(file);
                        // Clear URL field when file is selected
                        setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
                      }
                    }
                  }}
                  className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                />
                {thumbnailFile && !activeLesson && (
                  <p className="text-xs text-success font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="check_circle" className="text-sm" />
                      <span>{thumbnailFile.name} will be uploaded after lesson creation</span>
                    </span>
                  </p>
                )}
              </label>
            </div>
            <FormField
              label="Position"
              id="position"
              type="number"
              value={String(formData.position)}
              onChange={(value) => setFormData((prev) => ({ ...prev, position: Number(value) }))}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2">
              {activeLesson && (
                <button
                  type="button"
                  onClick={() => deleteLesson.mutate(activeLesson.id)}
                  className="rounded-lg border border-error/30 px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
                >
                  Delete lesson
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-content shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={saveLesson.isPending}
              >
                {saveLesson.isPending ? (
                  <>
                    <Icon name="hourglass_top" className="mr-2 text-xl" /> Saving...
                  </>
                ) : activeLesson ? (
                  <>
                    <Icon name="edit" className="mr-2 text-xl" /> Update Lesson
                  </>
                ) : (
                  <>
                    <Icon name="rocket_launch" className="mr-2 text-xl" /> Create Lesson
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-base-content">Lesson Order</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : lessons.length === 0 ? (
            <p className="mt-4 text-sm text-base-content/70">Add lessons to your course to start building content.</p>
          ) : (
            <LessonList lessons={lessons} activeLessonId={activeLesson?.id} onSelect={handleSelect} />
          )}
        </aside>
      </div>
    </div>
  );
}
