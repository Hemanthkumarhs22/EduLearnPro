import type { FormEvent } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Course } from "../types";
import CourseCard from "../components/CourseCard";
import { Icon } from "../components/Icon";

interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
}

async function fetchCourses(filters: CourseFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.level) params.set("level", filters.level);

  const { data } = await api.get<Course[]>(`/courses`, { params });
  return data;
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<CourseFilters>({});
  const [searchInput, setSearchInput] = useState("");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2 animate-pulse-slow leading-normal pb-3">Course Catalog</h1>
        <p className="text-base-content/70">Discover amazing courses to enhance your skills</p>
      </div>
      
      <header className="flex flex-col gap-4 rounded-2xl border-2 border-base-300 bg-base-200 p-4 shadow-xl hover-lift">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses by title..."
                className="flex-1 rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3  text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              />
              <select
                value={filters.category ?? ""}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value || undefined }))}
                className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              >
                <option value="">All categories</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
              </select>
              <select
                value={filters.level ?? ""}
                onChange={(event) => setFilters((prev) => ({ ...prev, level: event.target.value || undefined }))}
                className="rounded-xl border-2 border-base-300 bg-base-100 px-4 py-3 text-base-content shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
              >
                <option value="">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:rotate-1"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="search" className="text-xl" />
                  <span>Search</span>
                </span>
              </button>
        </form>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg" />
        </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl bg-base-200 border-2 border-base-300 p-8 text-center hover-lift">
              <div className="text-5xl mb-4 animate-bounce">
                <Icon name="search" className="text-5xl" />
              </div>
              <p className="text-lg font-semibold text-base-content">No courses found</p>
              <p className="text-base-content/70 mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
