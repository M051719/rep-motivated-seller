```typescript
// src/components/education/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LearningAnalyticsService from '../../services/analytics/LearningAnalytics';

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalWatchTime: number;
  certificates: number;
  streak: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessed: string;
  thumbnail_url?: string;
}

interface RecentCertificate {
  id: string;
  course_name: string;
  issued_at: string;
  certificate_number: string;
}

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalWatchTime: 0,
    certificates: 0,
    streak: 0
  });
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<RecentCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load analytics data
      const metricsData = await LearningAnalyticsService.getUserMetrics(user.id);
      setStats({
        totalCourses: metricsData.totalCourses,
        completedCourses: metricsData.completedCourses,
        totalLessons: metricsData.totalLessons,
        completedLessons: metricsData.completedLessons,
        totalWatchTime: metricsData.totalWatchTime,
        certificates: 0, // Will be updated below
        streak: metricsData.streak
      });

      // Load enrolled courses
      const courseAnalytics = await LearningAnalyticsService.getCourseAnalytics(user.id);
      const coursesData: EnrolledCourse[] = courseAnalytics.map(course => ({
        id: course.courseId,
        title: course.courseName,
        progress: course.progress,
        lessonsCompleted: course.lessonsCompleted,
        totalLessons: course.totalLessons,
        lastAccessed: course.lastAccessed
      }));
      setCourses(coursesData);

      // Load recent certificates
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issued_at,
          course:courses(title)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(5);

      const recentCerts: RecentCertificate[] = certificatesData?.map(cert => ({
        id: cert.id,
        course_name: cert.course?.title || 'Unknown Course',
        issued_at: cert.issued_at,
        certificate_number: cert.certificate_number
      })) || [];

      setCertificates(recentCerts);
      setStats(prev => ({ ...prev, certificates: recentCerts.length }));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📚 My Learning Dashboard
        </h1>
        <p className="text-gray-600">
          Track your progress, view certificates, and continue your education journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              <p className="text-xs text-green-600">
                {stats.completedCourses} completed
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedLessons}</p>
              <p className="text-xs text-gray-500">
                of {stats.totalLessons} total
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Watch Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(stats.totalWatchTime)}
              </p>
              <p className="text-xs text-gray-500">
                Total learning time
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Learning Streak</p>
              <p className="text-2xl font-bold text-orange-600">{stats.streak}</p>
              <p className="text-xs text-gray-500">
                days consecutive
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📖 My Courses</h2>
              <Link 
                to="/education"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Browse All Courses →
              </Link>
            </div>
            
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={`/education/course/${course.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 flex-1">
                          {course.title}
                        </h3>
                        <span className="text-sm text-gray-500 ml-4">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {course.lessonsCompleted}/{course.totalLessons} lessons
                        </span>
                        <span>
                          Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Link 
                    to="/education"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Certificates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Certificates</h2>
            
            {certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/education/certificate/${cert.id}`}
                      className="block p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <h3 className="font-medium text-yellow-800 text-sm mb-1">
                        {cert.course_name}
                      </h3>
                      <p className="text-xs text-yellow-600">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </Link>
                  </motion.div>
                ))}
                
                {certificates.length > 3 && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    +{certificates.length - 3} more certificates
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm text-gray-600">
                  Complete courses to earn certificates
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
            
            <div className="space-y-3">
              <Link
                to="/education"
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-medium text-blue-800">Browse Courses</p>
                  <p className="text-xs text-blue-600">Discover new learning opportunities</p>
                </div>
              </Link>
              
              <Link
                to="/education/analytics"
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-green-800">View Analytics</p>
                  <p className="text-xs text-green-600">Track your learning progress</p>
                </div>
              </Link>
              
              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-medium text-gray-800">Refresh Data</p>
                  <p className="text-xs text-gray-600">Update dashboard information</p>
                </div>
              </button>
            </div>
          </div>

          {/* Learning Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h2 className="text-lg font-semibold text-purple-900 mb-3">💡 Learning Tips</h2>
            <div className="space-y-2 text-sm">
              <p className="text-purple-700">
                • Set aside dedicated time for learning each day
              </p>
              <p className="text-purple-700">
                • Take notes during video lessons
              </p>
              <p className="text-purple-700">
                • Review course materials regularly
              </p>
              <p className="text-purple-700">
                • Apply what you learn to real situations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
```