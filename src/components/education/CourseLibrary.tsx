import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_minutes: number;
  difficulty_level: string;
  category: string;
}

const CourseLibrary: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchCourses = useCallback(async () => {
    let query = supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const categories = [
    { value: "all", label: "All Courses" },
    { value: "foreclosure", label: "Foreclosure Prevention" },
    { value: "credit-repair", label: "Credit Repair" },
    { value: "budgeting", label: "Financial Planning" },
    { value: "legal", label: "Legal Rights" },
    { value: "investing", label: "Real Estate Investing" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 Education Center
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Learn everything you need to know about foreclosure prevention, credit
          repair, and financial recovery.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses available
          </h3>
          <p className="text-gray-600">
            Check back soon for new educational content!
          </p>
        </div>
      )}
    </div>
  );
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-6xl">🎓</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}
          >
            {course.difficulty_level}
          </span>
          <span className="text-sm text-gray-500">
            {course.duration_minutes} min
          </span>
        </div>

        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Start Course
        </button>
      </div>
    </div>
  );
};

export default CourseLibrary;
