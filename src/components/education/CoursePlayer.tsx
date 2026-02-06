import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  lesson_order: number;
  transcript: string;
  resources: any;
}

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const fetchCourseData = useCallback(async () => {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("Error fetching course:", courseError);
      return;
    }

    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("lesson_order");

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
      return;
    }

    setCourse({
      ...courseData,
      lessons: lessonsData || [],
    });
    setLoading(false);
  }, [courseId]);

  const fetchUserProgress = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !courseId) return;

      const { data, error } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) {
        console.error("Error fetching user progress:", error);
        return;
      }

      const progressMap: { [key: string]: boolean } = {};
      data?.forEach((item) => {
        progressMap[item.lesson_id] = item.completed;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error("Error in fetchUserProgress:", error);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchUserProgress();
    }
  }, [courseId, fetchCourseData, fetchUserProgress]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎬 Course Player
        </h1>
        <p className="text-gray-600">
          Course player functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default CoursePlayer;
