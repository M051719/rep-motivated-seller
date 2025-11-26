```typescript
// src/services/analytics/LearningAnalytics.ts
import { supabase } from '../../lib/supabase';

export interface LearningMetrics {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalWatchTime: number;
  averageCompletionRate: number;
  streak: number;
  lastActivity: string;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessed: string;
  completionDate?: string;
}

export interface LearningActivity {
  date: string;
  lessonsWatched: number;
  timeSpent: number;
  coursesAccessed: string[];
}

class LearningAnalyticsService {
  // Get comprehensive learning metrics for a user
  async getUserMetrics(userId: string): Promise<LearningMetrics> {
    try {
      // Get enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(id, title, lessons(id))
        `)
        .eq('user_id', userId);

      if (enrollError) throw enrollError;

      // Get user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Calculate metrics
      const totalCourses = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => e.completed_at).length || 0;
      
      const totalLessons = enrollments?.reduce((acc, enrollment) => 
        acc + (enrollment.course?.lessons?.length || 0), 0) || 0;
      
      const completedLessons = progress?.filter(p => p.completed_at).length || 0;
      const totalWatchTime = progress?.reduce((acc, p) => acc + (p.watch_time || 0), 0) || 0;
      
      const averageCompletionRate = totalLessons > 0 ? 
        (completedLessons / totalLessons) * 100 : 0;

      // Calculate learning streak
      const streak = await this.calculateLearningStreak(userId);

      // Get last activity
      const lastActivity = progress?.length > 0 ? 
        Math.max(...progress.map(p => new Date(p.last_watched_at || p.created_at).getTime())) : 0;

      return {
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        totalWatchTime,
        averageCompletionRate,
        streak,
        lastActivity: lastActivity ? new Date(lastActivity).toISOString() : ''
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw error;
    }
  }

  // Get detailed analytics for each course
  async getCourseAnalytics(userId: string): Promise<CourseAnalytics[]> {
    try {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(
            id, title,
            lessons(id)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const analytics: CourseAnalytics[] = [];

      for (const enrollment of enrollments || []) {
        const { data: courseProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', enrollment.course_id);

        const totalLessons = enrollment.course?.lessons?.length || 0;
        const completedLessons = courseProgress?.filter(p => p.completed_at).length || 0;
        const timeSpent = courseProgress?.reduce((acc, p) => acc + (p.watch_time || 0), 0) || 0;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        const lastAccessed = courseProgress?.length > 0 ?
          Math.max(...courseProgress.map(p => new Date(p.last_watched_at || p.created_at).getTime())) : 
          new Date(enrollment.enrolled_at).getTime();

        analytics.push({
          courseId: enrollment.course_id,
          courseName: enrollment.course?.title || '',
          progress,
          lessonsCompleted: completedLessons,
          totalLessons,
          timeSpent,
          lastAccessed: new Date(lastAccessed).toISOString(),
          completionDate: enrollment.completed_at
        });
      }

      return analytics;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  // Get daily learning activity for charts
  async getLearningActivity(userId: string, days: number = 30): Promise<LearningActivity[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: progress, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          lesson:lessons(course_id, course:courses(title))
        `)
        .eq('user_id', userId)
        .gte('last_watched_at', startDate.toISOString());

      if (error) throw error;

      // Group by date
      const activityMap = new Map<string, LearningActivity>();

      for (const p of progress || []) {
        const date = new Date(p.last_watched_at || p.created_at).toISOString().split('T')[0];
        
        if (!activityMap.has(date)) {
          activityMap.set(date, {
            date,
            lessonsWatched: 0,
            timeSpent: 0,
            coursesAccessed: []
          });
        }

        const activity = activityMap.get(date)!;
        activity.lessonsWatched += 1;
        activity.timeSpent += p.watch_time || 0;
        
        const courseTitle = p.lesson?.course?.title;
        if (courseTitle && !activity.coursesAccessed.includes(courseTitle)) {
          activity.coursesAccessed.push(courseTitle);
        }
      }

      return Array.from(activityMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error fetching learning activity:', error);
      throw error;
    }
  }

  // Calculate learning streak (consecutive days with activity)
  private async calculateLearningStreak(userId: string): Promise<number> {
    try {
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('last_watched_at, created_at')
        .eq('user_id', userId)
        .order('last_watched_at', { ascending: false });

      if (error || !progress?.length) return 0;

      const dates = progress.map(p => 
        new Date(p.last_watched_at || p.created_at).toISOString().split('T')[0]
      );

      const uniqueDates = [...new Set(dates)].sort().reverse();
      
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Check if there's activity today or yesterday
      if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
      }

      // Count consecutive days
      let expectedDate = new Date();
      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (dateStr === expectedDateStr) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Track lesson view event
  async trackLessonView(userId: string, lessonId: string, courseId: string): Promise<void> {
    try {
      await supabase
        .from('learning_events')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          event_type: 'lesson_view',
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking lesson view:', error);
    }
  }

  // Track video progress
  async trackVideoProgress(
    userId: string, 
    lessonId: string, 
    courseId: string, 
    watchTime: number, 
    totalDuration: number
  ): Promise<void> {
    try {
      const percentage = totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0;
      
      await supabase
        .from('learning_events')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          event_type: 'video_progress',
          metadata: {
            watchTime,
            totalDuration,
            percentage
          },
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  }
}

export default new LearningAnalyticsService();
```