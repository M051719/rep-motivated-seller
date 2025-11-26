```typescript
// src/components/education/EnhancedCoursePlayer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import VideoPlayer from './video/VideoPlayer';
import { 
  CheckCircleIcon, 
  PlayIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  video_provider: string;
  video_id?: string;
  video_duration: number;
  lesson_order: number;
  transcript?: string;
  resources: any[];
  quiz_questions: any[];
  is_preview: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  learning_objectives: string[];
  lessons: Lesson[];
}

interface UserProgress {
  [lessonId: string]: {
    completed: boolean;
    watchTime: number;
    completionPercentage: number;
    notes?: string;
  };
}

const EnhancedCoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (courseId) {
      Promise.all([
        fetchCourseData(),
        checkEnrollment(),
        fetchUserProgress()
      ]).finally(() => setLoading(false));
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order');

      if (lessonsError) throw lessonsError;

      setCourse({
        ...courseData,
        lessons: lessonsData || []
      });
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      setEnrollment(data);
    } catch (error) {
      // Not enrolled yet
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      const progressMap: UserProgress = {};
      data?.forEach(progress => {
        progressMap[progress.lesson_id] = {
          completed: !!progress.completed_at,
          watchTime: progress.watch_time || 0,
          completionPercentage: progress.completion_percentage || 0,
          notes: progress.notes
        };
      });
      
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString()
        });

      if (error) throw error;

      setEnrollment({ enrolled_at: new Date().toISOString() });
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50';
      successDiv.textContent = '🎉 Successfully enrolled! You can now access all course content.';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const updateProgress = async (lessonId: string, watchTime: number, percentage: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          watch_time: Math.max(watchTime, userProgress[lessonId]?.watchTime || 0),
          completion_percentage: Math.max(percentage, userProgress[lessonId]?.completionPercentage || 0),
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          watchTime: Math.max(watchTime, prev[lessonId]?.watchTime || 0),
          completionPercentage: Math.max(percentage, prev[lessonId]?.completionPercentage || 0)
        }
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          completion_percentage: 100,
          updated_at: new Date().toISOString()
        });

      setUserProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          completed: true,
          completionPercentage: 100
        }
      }));

      // Check if course is complete
      const completedCount = Object.values(userProgress).filter(p => p.completed).length + 1;
      if (course && completedCount === course.lessons.length) {
        generateCertificate();
      }

      // Auto-advance to next lesson
      if (currentLessonIndex < course!.lessons.length - 1) {
        setTimeout(() => setCurrentLessonIndex(currentLessonIndex + 1), 1000);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const saveNotes = async (lessonId: string, notes: string) => {
    setSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          notes: notes,
          updated_at: new Date().toISOString()
        });

      setUserProgress(prev => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          notes: notes
        }
      }));

      // Show success feedback
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg z-50';
      successDiv.textContent = '✅ Notes saved!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 2000);

    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const generateCertificate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !course) return;

      const certificateNumber = `RMS-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();

      const { error } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          course_id: course.id,
          certificate_number: certificateNumber,
          verification_code: verificationCode,
          completion_percentage: 100.00
        });

      if (error) throw error;

      // Show celebration
      const celebrationDiv = document.createElement('div');
      celebrationDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      celebrationDiv.innerHTML = `
        <div class="bg-white p-8 rounded-lg text-center max-w-md">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h2>
          <p class="text-gray-600 mb-6">You've completed "${course.title}" and earned a certificate!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Continue Learning
          </button>
        </div>
      `;
      document.body.appendChild(celebrationDiv);

    } catch (error) {
      console.error('Certificate generation error:', error);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const canAccessLesson = currentLesson?.is_preview || enrollment;
  const completedLessons = Object.values(userProgress).filter(p => p.completed).length;
  const totalLessons = course.lessons.length;
  const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <nav className="text-sm breadcrumbs mb-4">
          <span className="text-gray-500">
            <a href="/education" className="hover:text-blue-600">Education</a>
            {' > '}
            <span className="text-gray-900">{course.title}</span>
          </span>
        </nav>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>👨‍🏫 {course.instructor_name}</span>
              <span>📚 {totalLessons} lessons</span>
              <span>⏱️ {Math.ceil(course.lessons.reduce((sum, lesson) => sum + lesson.video_duration, 0) / 60)} min total</span>
            </div>
          </div>
          
          {enrollment && (
            <div className="bg-white rounded-lg shadow-md p-4 min-w-[200px]">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round(courseProgress)}%
                </div>
                <div className="text-sm text-gray-600 mb-2">Course Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${courseProgress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {completedLessons}/{totalLessons} lessons completed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Video Area */}
        <div className="lg:col-span-3">
          {canAccessLesson ? (
            <>
              <VideoPlayer
                lesson={currentLesson}
                onProgress={(watchTime, percentage) => 
                  updateProgress(currentLesson.id, watchTime, percentage)
                }
                onComplete={() => markLessonComplete(currentLesson.id)}
                className="mb-6"
              />
              
              {/* Lesson Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLesson.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {currentLesson.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span>📖 Lesson {currentLessonIndex + 1} of {course.lessons.length}</span>
                      <span>⏱️ {Math.ceil(currentLesson.video_duration / 60)} minutes</span>
                      {userProgress[currentLesson.id]?.completed && (
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      <span>Notes</span>
                    </button>
                    
                    {currentLesson.transcript && (
                      <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Transcript</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigator.share?.({
                          title: currentLesson.title,
                          url: window.location.href
                        }) || navigator.clipboard.writeText(window.location.href);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">Your Notes</h3>
                      <textarea
                        value={currentNotes || userProgress[currentLesson.id]?.notes || ''}
                        onChange={(e) => setCurrentNotes(e.target.value)}
                        placeholder="Add your notes for this lesson..."
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            saveNotes(currentLesson.id, currentNotes);
                          }}
                          disabled={savingNotes}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transcript Section */}
                <AnimatePresence>
                  {showTranscript && currentLesson.transcript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">Transcript</h3>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {currentLesson.transcript}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 mt-6 border-t">
                  <button
                    onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                    disabled={currentLessonIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markLessonComplete(currentLesson.id)}
                      disabled={userProgress[currentLesson.id]?.completed}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>
                        {userProgress[currentLesson.id]?.completed ? 'Completed' : 'Mark Complete'}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentLessonIndex(Math.min(course.lessons.length - 1, currentLessonIndex + 1))}
                      disabled={currentLessonIndex === course.lessons.length - 1}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                      <span>Next</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            /* Enrollment Required */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center"
            >
              <div className="text-center text-white p-8 max-w-md">
                <div className="text-6xl mb-6">🔒</div>
                <h3 className="text-2xl font-bold mb-4">Enroll to Access This Course</h3>
                <p className="text-gray-300 mb-8">
                  Get full access to all {course.lessons.length} lessons, downloadable resources, 
                  and earn a certificate upon completion.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Lifetime access to all course content</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Progress tracking and notes</span>
                  </div>
                </div>
                
                <button
                  onClick={handleEnroll}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
                >
                  🎓 Enroll Now - Free
                </button>
                
                <p className="text-xs text-gray-400 mt-4">
                  No credit card required. Start learning immediately.
                </p>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Course Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 className="font-semibold text-lg mb-4">📚 Course Content</h3>
            
            {/* Lessons List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.lessons.map((lesson, index) => {
                const progress = userProgress[lesson.id];
                const isAccessible = lesson.is_preview || enrollment;
                const isActive = index === currentLessonIndex;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => isAccessible && setCurrentLessonIndex(index)}
                    disabled={!isAccessible}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm'
                        : isAccessible 
                          ? 'hover:bg-gray-50 border border-transparent hover:border-gray-200' 
                          : 'bg-gray-100 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center mb-2">
                          <span className="text-xs text-gray-500 mr-2 font-mono">
                            {(index + 1).toString().padStart(2, '0')}.
                          </span>
                          
                          {lesson.is_preview && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded mr-2 font-medium">
                              FREE
                            </span>
                          )}
                          
                          {!isAccessible && (
                            <span className="text-gray-400 mr-2">🔒</span>
                          )}
                          
                          {progress?.completed && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          )}
                        </div>
                        
                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {lesson.title}
                        </h4>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{Math.ceil(lesson.video_duration / 60)} min</span>
                          {isAccessible && (
                            <PlayIcon className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {progress?.completionPercentage > 0 && progress?.completionPercentage < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all"
                          style={{ width: `${progress.completionPercentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Course Resources */}
            {currentLesson?.resources && currentLesson.resources.length > 0 && canAccessLesson && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">📎 Lesson Resources</h4>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource: any, index: number) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-gray-500 mr-2">
                        {resource.type === 'pdf' ? '📄' : 
                         resource.type === 'link' ? '🔗' : 
                         resource.type === 'download' ? '📥' : '📄'}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">{resource.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">🎯 Learning Objectives</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">✓</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCoursePlayer;
```