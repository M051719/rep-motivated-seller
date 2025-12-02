import React, { useState, useEffect, memo, useMemo, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { trackPageView, trackEvent } from '../lib/analytics';
import { DashboardNavigation } from '../components/DashboardNavigation';
import { toast } from 'react-hot-toast';

// Types
interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

interface Stats {
  familiesHelped: number;
  coursesCompleted: number;
  certificatesIssued: number;
  activeStudents: number;
}

// Lazy loaded components for better performance
const FeaturedCourses = React.lazy(() => import('../components/sections/FeaturedCourses'));
const SuccessStories = React.lazy(() => import('../components/sections/SuccessStories'));

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  const initialStats = useMemo(() => ({
    familiesHelped: 1250,
    coursesCompleted: 3400,
    certificatesIssued: 890,
    activeStudents: 445
  }), []);

  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get current user (non-blocking)
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          setIsAdmin(profile?.is_admin || false);
        }

        // Load stats inline (non-blocking) - moved inline to avoid useCallback dependency issues
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id');

          if (!usersError && usersData) {
            setStats(prev => ({
              ...prev,
              activeStudents: usersData.length
            }));
          }
        } catch (err) {
          console.warn('Could not load stats:', err);
        }
        
        // Track page view (non-blocking)
        try {
          trackPageView('Homepage');
        } catch (err) {
          console.warn('Analytics tracking failed:', err);
        }

      } catch (error) {
        console.error('Error initializing homepage:', error);
      } finally {
        // Set loading to false immediately so page renders
        setLoading(false);
      }
    };

    initializePage();
  }, []);  const handleCTAClick = useCallback((ctaType: string) => {
    trackEvent('CTA_Click', { 
      type: ctaType, 
      page: 'homepage',
      user_id: user?.id || 'anonymous'
    });
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>RepMotivatedSeller - Save Your Home from Foreclosure | 24/7 Expert Help</title>
        <meta name="description" content="Complete foreclosure assistance ecosystem with 24/7 AI support, expert education, and community help. We've helped 1,250+ families save their homes. Free consultation available." />
        <meta name="keywords" content="foreclosure help, save home, foreclosure prevention, mortgage assistance, foreclosure attorney, home loan modification" />
        <meta property="og:title" content="Save Your Home - Transform Your Future | RepMotivatedSeller" />
        <meta property="og:description" content="Complete foreclosure assistance with 24/7 AI support and expert education. Free consultation available now." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://repmotivatedseller.com" />
        <meta property="og:image" content="/images/hero-social.jpg" />
        <link rel="canonical" href="https://repmotivatedseller.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "RepMotivatedSeller",
            "description": "Complete foreclosure assistance ecosystem",
            "url": "https://repmotivatedseller.com",
            "sameAs": ["https://facebook.com/repmotivatedseller"],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+18778064677",
              "contactType": "customer service"
            }
          })}
        </script>
      </Helmet>

      <div className="homepage">
        {/* Hero Section */}
        <HeroSection user={user} stats={stats} onCTAClick={handleCTAClick} />

        {/* Dashboard Navigation for Authenticated Users */}
          <DashboardNavigation user={user} isAdmin={isAdmin} />

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Loan Application CTA - Prominent section for unauthenticated users */}
        {!user && <LoanApplicationCTA onCTAClick={handleCTAClick} />}

        {/* Featured Courses */}
        <Suspense fallback={<SectionLoading />}>
          <FeaturedCourses />
        </Suspense>

        {/* Services Overview */}
        <ServicesOverview onServiceClick={handleCTAClick} />

        {/* Success Stories */}
        <Suspense fallback={<SectionLoading />}>
          <SuccessStories />
        </Suspense>

        {/* Emergency Contact CTA */}
        <ContactCTA onCTAClick={handleCTAClick} />
      </div>
    </>
  );
};

// Memoized Hero Component
const HeroSection = memo<{ 
  user: User | null; 
  stats: Stats; 
  onCTAClick: (type: string) => void;
}>(({ user, stats, onCTAClick }) => (
  <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white overflow-hidden">
    {/* Background elements */}
    <div className="absolute inset-0 bg-black opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-900 opacity-30"></div>
    
    <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
      <div className="text-center">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🏠 Save Your Home
          <br />
          <span className="text-yellow-400">Transform Your Future</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Complete foreclosure assistance ecosystem: 24/7 AI support, expert education, 
          direct outreach, and a community that cares. We've helped{' '}
          <strong className="text-yellow-300">{stats.familiesHelped.toLocaleString()} families</strong>{' '}
          save their homes.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {user ? (
            <>
              <Link
                to="/education/dashboard"
                className="bg-yellow-500 text-black px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
                onClick={() => onCTAClick('dashboard')}
              >
                📊 My Dashboard
              </Link>
              <Link
                to="/education"
                className="bg-white text-blue-900 px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                onClick={() => onCTAClick('continue_learning')}
              >
                🎓 Continue Learning
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/loan-application"
                className="bg-green-600 text-white px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => onCTAClick('loan_application')}
              >
                💰 Get Funding Now
              </Link>
              <Link
                to="/what-we-do"
                className="bg-white text-blue-900 px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                onClick={() => onCTAClick('what_we_do')}
              >
                📋 What We Do
              </Link>
              <Link
                to="/foreclosure-help"
                className="bg-red-600 text-white px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => onCTAClick('foreclosure_help')}
              >
                🆘 Foreclosure Help
              </Link>
            </>
          )}
        </motion.div>

        {/* Enhanced Key Features */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { icon: '🤖', title: '24/7 AI Assistant', desc: 'Instant answers anytime' },
            { icon: '🎓', title: 'Expert Education', desc: 'Learn from professionals' },
            { icon: '📬', title: 'Direct Outreach', desc: 'We find and help you' },
            { icon: '💪', title: 'Community Support', desc: "You're not alone" }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-opacity-20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-2xl sm:text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
));

// Enhanced Services Overview
const ServicesOverview = memo<{ onServiceClick: (type: string) => void }>(({ onServiceClick }) => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🛡️ Complete Protection Ecosystem
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We've built the most comprehensive foreclosure prevention system ever created
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            icon: '🆘',
            title: 'Crisis Response',
            description: 'Immediate help when you need it most',
            features: ['24/7 hotline', 'Emergency consultation', 'Rapid response team', 'Crisis intervention'],
            link: '/foreclosure',
            color: 'red'
          },
          {
            icon: '🎓',
            title: 'Education Platform',
            description: 'Learn everything about foreclosure prevention',
            features: ['Video courses', 'Expert instruction', 'Certificates', 'Progress tracking'],
            link: '/knowledge-base',
            color: 'blue'
          },
          {
            icon: '📬',
            title: 'Outreach Program',
            description: 'We find families at risk and offer help',
            features: ['Direct mail campaigns', 'SMS outreach', 'Email education', 'Community events'],
            link: '/consultation',
            color: 'green'
          },
          {
            icon: '🤖',
            title: 'AI Assistant',
            description: 'Smart help available anytime',
            features: ['Instant answers', 'Document help', 'Timeline guidance', 'Resource finder'],
            link: '/help',
            color: 'purple'
          },
          {
            icon: '📊',
            title: 'Resources & Tools',
            description: 'Templates, calculators, and guides',
            features: ['Document templates', 'Calculators', 'Checklists', 'Video tutorials'],
            link: '/resources',
            color: 'indigo'
          },
          {
            icon: '🏆',
            title: 'Success Stories',
            description: 'See how we help families succeed',
            features: ['Case studies', 'Testimonials', 'Before & after', 'Community impact'],
            link: '/success-stories',
            color: 'yellow'
          }
        ].map((service, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
            
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link 
              to={service.link}
              className={`inline-flex items-center text-${service.color}-600 font-medium hover:text-${service.color}-700 transition-colors group-hover:translate-x-1 transform duration-300`}
              onClick={() => onServiceClick(`service_${service.title.toLowerCase().replace(/\s+/g, '_')}`)}
            >
              Learn More 
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));

// Enhanced Contact CTA
const ContactCTA = memo<{ onCTAClick: (type: string) => void }>(({ onCTAClick }) => (
  <section className="py-20 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black opacity-10"></div>
    
    <div className="relative max-w-4xl mx-auto text-center px-4">
      <motion.h2 
        className="text-3xl sm:text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🚨 Facing Foreclosure RIGHT NOW?
      </motion.h2>
      
      <motion.p 
        className="text-lg sm:text-xl mb-8 text-red-100 leading-relaxed"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Don't wait another day. Every moment matters when your home is at risk.
        Get immediate expert help - completely free.
      </motion.p>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <a
          href="tel:+18778064677"
          className="bg-white text-red-600 px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition-all duration-300 animate-pulse transform hover:scale-105"
          onClick={() => onCTAClick('emergency_call')}
        >
          📞 CALL NOW: (877) 806-4677
        </a>
        <Link 
          to="/foreclosure-help"
          className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105"
          onClick={() => onCTAClick('online_help')}
        >
          💬 Get Help Online
        </Link>
      </motion.div>

      <motion.p 
        className="text-sm text-red-200 flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <span>✅ Free consultation</span>
        <span>✅ No obligation</span>
        <span>✅ Immediate response</span>
        <span>✅ 100% confidential</span>
      </motion.p>
    </div>
  </section>
));

// Loading components
const SectionLoading = () => (
  <div className="py-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const QuickActionsLoading = () => (
  <div className="py-8 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="animate-pulse flex space-x-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-20 rounded-lg flex-1"></div>
        ))}
      </div>
    </div>
  </div>
);

// Stats Overview Component (inline for now)
const StatsOverview = memo<{ stats: Stats }>(({ stats }) => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
            {stats.familiesHelped.toLocaleString()}
          </div>
          <div className="text-gray-600">Families Helped</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
            {stats.coursesCompleted.toLocaleString()}
          </div>
          <div className="text-gray-600">Courses Completed</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
            {stats.certificatesIssued.toLocaleString()}
          </div>
          <div className="text-gray-600">Certificates Issued</div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
            {stats.activeStudents.toLocaleString()}
          </div>
          <div className="text-gray-600">Active Students</div>
        </div>
      </div>
    </div>
  </section>
));

// Quick Actions Component (inline for now)
const QuickActions = memo(() => (
  <section className="py-8 bg-blue-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/education/dashboard" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold">My Courses</div>
        </Link>
        <Link to="/profile" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold">Profile</div>
        </Link>
        <Link to="/certificates" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-semibold">Certificates</div>
        </Link>
        <Link to="/support" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">💬</div>
          <div className="font-semibold">Support</div>
        </Link>
      </div>
    </div>
  </section>
));

// Loan Application CTA Component
const LoanApplicationCTA = memo<{ onCTAClick: (type: string) => void }>(({ onCTAClick }) => (
  <section className="py-20 bg-gradient-to-br from-green-600 via-green-700 to-teal-700 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black opacity-10"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-teal-900 opacity-20"></div>

    <div className="relative max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            💰 Need Private Money Financing?
          </h2>
          <p className="text-xl sm:text-2xl mb-6 text-green-100 leading-relaxed">
            Fast approval • Competitive rates • Flexible terms
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-lg">8-15% Interest Rates</p>
                <p className="text-green-100 text-sm">Competitive private money loan rates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-lg">$30K - FHA Cap</p>
                <p className="text-green-100 text-sm">Flexible loan amounts for your needs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-lg">6-24 Month Terms</p>
                <p className="text-green-100 text-sm">Short-term financing that works for you</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-lg">Zero Tolerance Fraud Policy</p>
                <p className="text-green-100 text-sm">Secure, transparent, and trustworthy lending</p>
              </div>
            </div>
          </div>

          <Link
            to="/loan-application"
            className="inline-block bg-white text-green-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
            onClick={() => onCTAClick('loan_application')}
          >
            Apply Now - Free Pre-Qualification
          </Link>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 text-gray-900"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Pre-Loan Application Process</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Review & Accept Policies</p>
                <p className="text-sm text-gray-600">Read and agree to our zero tolerance fraud policy and terms</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Complete Application</p>
                <p className="text-sm text-gray-600">Fill out your property and financial information</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Upload Documents</p>
                <p className="text-sm text-gray-600">Submit required documents with easy upload</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Get Approved</p>
                <p className="text-sm text-gray-600">Receive decision within 24-48 hours</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              By using RepMotivatedSeller, you agree to our{' '}
              <Link to="/terms-of-service" className="text-green-600 hover:underline font-semibold">Terms</Link>,{' '}
              <Link to="/privacy-policy" className="text-green-600 hover:underline font-semibold">Privacy Policy</Link>,{' '}
              <Link to="/refund-policy" className="text-green-600 hover:underline font-semibold">Refund Policy</Link>, and{' '}
              <Link to="/disclaimer" className="text-green-600 hover:underline font-semibold">Disclaimer</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
));

export default HomePage;




