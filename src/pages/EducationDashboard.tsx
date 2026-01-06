import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Download, 
  Award, 
  TrendingUp,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BackButton } from '../components/ui/BackButton';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoUrl?: string;
  completed: boolean;
  locked: boolean;
  requiredTier: 'free' | 'entrepreneur' | 'professional' | 'enterprise';
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  downloadUrl?: string;
  hasAiAssistance: boolean;
}

interface EducationProgress {
  coursesCompleted: number;
  totalCourses: number;
  certificatesEarned: number;
  hoursLearned: number;
  currentStreak: number;
}

const EducationDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<EducationProgress>({
    coursesCompleted: 0,
    totalCourses: 12,
    certificatesEarned: 0,
    hoursLearned: 0,
    currentStreak: 0
  });
  const [userTier, setUserTier] = useState<string>('free');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Courses data - Hardship Letters, Wholesale Contracts, Site How-Tos
  const courses: Course[] = [
    {
      id: 'hardship-letters',
      title: 'Hardship Letter Writing Mastery',
      description: 'Learn to write compelling hardship letters that get results. Includes templates and AI-assisted writing.',
      duration: '2.5 hours',
      difficulty: 'Beginner',
      completed: false,
      locked: false,
      requiredTier: 'free',
      modules: [
        {
          id: 'hl-intro',
          title: 'Understanding Hardship Letters',
          duration: '20 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder1',
          hasAiAssistance: false
        },
        {
          id: 'hl-template',
          title: 'Using Professional Templates',
          duration: '30 min',
          completed: false,
          downloadUrl: '/templates/hardship-letter-template.pdf',
          hasAiAssistance: true
        },
        {
          id: 'hl-ai-writing',
          title: 'AI-Assisted Letter Generation',
          duration: '45 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder2',
          hasAiAssistance: true
        }
      ]
    },
    {
      id: 'wholesale-contracts',
      title: 'Wholesale Contract Fundamentals (ALL TIERS)',
      description: 'Master wholesale real estate contracts. Download templates and get expert guidance on every clause.',
      duration: '3 hours',
      difficulty: 'Intermediate',
      completed: false,
      locked: false,
      requiredTier: 'free',
      modules: [
        {
          id: 'wc-basics',
          title: 'Contract Basics & Structure',
          duration: '40 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder3',
          hasAiAssistance: false
        },
        {
          id: 'wc-templates',
          title: 'Downloadable Contract Templates',
          duration: '30 min',
          completed: false,
          downloadUrl: '/contracts/wholesale-purchase-agreement.pdf',
          hasAiAssistance: false
        },
        {
          id: 'wc-clauses',
          title: 'Key Clauses & Protections',
          duration: '50 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder4',
          hasAiAssistance: true
        }
      ]
    },
    {
      id: 'site-features',
      title: 'RepMotivatedSeller Platform Guide',
      description: 'Learn to use every feature of our platform to maximize your foreclosure prevention success.',
      duration: '2 hours',
      difficulty: 'Beginner',
      completed: false,
      locked: false,
      requiredTier: 'free',
      modules: [
        {
          id: 'sf-dashboard',
          title: 'Navigating Your Dashboard',
          duration: '25 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder5',
          hasAiAssistance: false
        },
        {
          id: 'sf-deal-analyzer',
          title: 'Using the Deal Analyzer',
          duration: '35 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder6',
          hasAiAssistance: true
        },
        {
          id: 'sf-ai-assistant',
          title: 'Maximizing AI Assistant Features',
          duration: '30 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder7',
          hasAiAssistance: true
        }
      ]
    },
    {
      id: 'ai-report-generation',
      title: 'AI-Powered Report Generation (PAID TIERS)',
      description: 'Use AI to create professional reports, analyses, and documentation instantly.',
      duration: '1.5 hours',
      difficulty: 'Advanced',
      completed: false,
      locked: userTier === 'free',
      requiredTier: 'entrepreneur',
      modules: [
        {
          id: 'ai-setup',
          title: 'Setting Up AI Tools',
          duration: '20 min',
          completed: false,
          videoUrl: 'https://www.youtube.com/embed/placeholder9',
          hasAiAssistance: true
        },
        {
          id: 'ai-reports',
          title: 'Generating Custom Reports',
          duration: '45 min',
          completed: false,
          hasAiAssistance: true
        }
      ]
    }
  ];

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserTier(profile.tier || 'free');
      }

      // Load education progress from database
      const { data: progressData } = await supabase
        .from('education_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData) {
        setProgress({
          coursesCompleted: progressData.courses_completed || 0,
          totalCourses: 12,
          certificatesEarned: progressData.certificates_earned || 0,
          hoursLearned: progressData.hours_learned || 0,
          currentStreak: progressData.current_streak || 0
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleModuleComplete = async (courseId: string, moduleId: string) => {
    if (!user) {
      toast.error('Please log in to track progress');
      return;
    }

    try {
      await supabase.from('education_progress').upsert({
        user_id: user.id,
        course_id: courseId,
        module_id: moduleId,
        completed_at: new Date().toISOString()
      });

      toast.success('Module completed! 🎉');
      loadUserProgress();
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleDownload = (url: string, title: string) => {
    toast.success(`Downloading ${title}...`);
    // In production, this would trigger actual download
    window.open(url, '_blank');
  };

  const handleAiAssistance = (moduleTitle: string) => {
    toast.success(`Opening AI Assistant for ${moduleTitle}...`);
    window.open('/ai-chat?context=' + encodeURIComponent(moduleTitle), '_blank');
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'entrepreneur': return 'bg-blue-100 text-blue-700';
      case 'professional': return 'bg-purple-100 text-purple-700';
      case 'enterprise': return 'bg-gold-100 text-gold-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎓 Education Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master foreclosure prevention with expert-led courses, downloadable templates, and AI-powered assistance
          </p>
        </motion.div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Courses Completed</p>
                <p className="text-3xl font-bold text-gray-900">{progress.coursesCompleted}/{progress.totalCourses}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Certificates Earned</p>
                <p className="text-3xl font-bold text-gray-900">{progress.certificatesEarned}</p>
              </div>
              <Award className="w-12 h-12 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours Learned</p>
                <p className="text-3xl font-bold text-gray-900">{progress.hoursLearned}</p>
              </div>
              <Clock className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{progress.currentStreak} days</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                course.locked ? 'opacity-60' : 'hover:scale-105'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      {course.locked && <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTierBadgeColor(course.requiredTier)}`}>
                    {course.requiredTier.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>
                      {course.modules.filter(m => m.completed).length}/{course.modules.length} modules
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(course.modules.filter(m => m.completed).length / course.modules.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCourse(course)}
                  disabled={course.locked}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    course.locked
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {course.locked ? 'Upgrade to Unlock' : 'Start Learning'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Detail Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                      <p className="text-gray-600">{selectedCourse.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedCourse.modules.map((module) => (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {module.duration}
                            </p>
                          </div>
                          {module.completed && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          {module.videoUrl && (
                            <button
                              onClick={() => setPlayingVideo(module.id)}
                              className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              Watch Video
                            </button>
                          )}
                          {module.downloadUrl && (
                            <button
                              onClick={() => handleDownload(module.downloadUrl!, module.title)}
                              className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          )}
                          {module.hasAiAssistance && (
                            <button
                              onClick={() => handleAiAssistance(module.title)}
                              className="flex-1 min-w-[120px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" />
                              AI Assist
                            </button>
                          )}
                          {!module.completed && (
                            <button
                              onClick={() => handleModuleComplete(selectedCourse.id, module.id)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Important Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">IMPORTANT NOTICE</h3>
              <p className="text-lg opacity-90">
                All loans must be processed through RepMotivatedSeller
              </p>
              <p className="text-sm opacity-75 mt-1">
                Platform data protected by law
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EducationDashboard;
