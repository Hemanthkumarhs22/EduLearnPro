import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";
import type { Course } from "../types";
import CourseCard from "../components/CourseCard";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";

type CourseFormData = {
  title: string;
  description: string;
  category: string;
  level: Course["level"];
  status: Course["status"];
};

const defaultForm: CourseFormData = {
  title: "",
  description: "",
  category: "",
  level: "beginner",
  status: "draft",
};

async function fetchMyCourses() {
  const { data } = await api.get<Course[]>("/courses/mine");
  return data;
}

export default function CourseManagementPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CourseFormData>(defaultForm);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: courses = [], isLoading } = useQuery({ queryKey: ["my-courses"], queryFn: fetchMyCourses });

  const mutation = useMutation({
    mutationFn: async (payload: CourseFormData & { id?: string | null }) => {
      const body: Record<string, unknown> = {
        ...payload,
        thumbnail_url: null,
      };
      
      if (payload.id) {
        await api.put(`/courses/${payload.id}`, body);
      } else {
        await api.post("/courses", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      resetForm();
    },
    onError: () => setError("Unable to save course. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await api.delete(`/courses/${courseId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
  });

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingCourseId(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    await mutation.mutateAsync({ ...formData, id: editingCourseId });
  };

  const handleEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      status: course.status,
    });
  };

  const activeTitle = useMemo(() => (editingCourseId ? "Edit Course" : "Create New Course"), [editingCourseId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-base-content">Course Management</h1>
        <p className="text-sm text-base-content/70">Create and maintain your learning experiences.</p>
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-base-content">{activeTitle}</h2>
          {editingCourseId && (
            <button onClick={resetForm} className="text-sm text-primary hover:text-primary-focus">
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <FormField label="Title" id="title" value={formData.title} onChange={(value) => setFormData((prev) => ({ ...prev, title: value }))} required />
          </div>
          <div>
            <FormField label="Category" id="category" value={formData.category} onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))} required />
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Description"
              id="description"
              value={formData.description}
              onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
              textarea
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm text-base-content/70">
              <span className="font-medium text-base-content">Level</span>
              <select
                value={formData.level}
                onChange={(event) => setFormData((prev) => ({ ...prev, level: event.target.value as Course["level"] }))}
                className="rounded-lg border border-base-300 px-3 py-2 text-base-content bg-base-100 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-base-content/70">
              <span className="font-medium text-base-content">Status</span>
              <select
                value={formData.status}
                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as Course["status"] }))}
                className="rounded-lg border border-base-300 px-3 py-2 text-base-content bg-base-100 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-content shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Icon name="hourglass_top" className="mr-2 text-xl" /> Saving...
                </>
              ) : editingCourseId ? (
                <>
                  <Icon name="edit" className="mr-2 text-xl" /> Update Course
                </>
              ) : (
                <>
                  <Icon name="rocket_launch" className="mr-2 text-xl" /> Create Course
                </>
              )}
            </button>
          </div>
          {error && <p className="md:col-span-2 text-sm text-error">{error}</p>}
        </form>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-base-content">Your Courses</h2>
          <span className="text-sm text-base-content/70">{courses.length} total</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-4 text-sm text-base-content/70">Create your first course to share knowledge.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="space-y-3">
                <CourseCard
                  course={course}
                  showManageActions
                  onEdit={handleEdit}
                  onDelete={(selected) => deleteMutation.mutate(selected.id)}
                />
                <div className="flex gap-2">
                  <Link
                    to={`/instructor/courses/${course.id}/lessons`}
                    className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-content hover:bg-primary-focus"
                  >
                    Manage Lessons
                  </Link>
                  <Link
                    to={`/catalog/${course.id}`}
                    className="flex-1 rounded-md border border-base-300 px-3 py-2 text-center text-sm font-semibold text-base-content hover:bg-base-300"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
