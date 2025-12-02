import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import stripePromise from './lib/stripe'
import { Toaster } from 'react-hot-toast'

// Layout components
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import { ScrollToTop } from './components/ScrollToTop'

// Pages
import Homepage from './pages/homepage'
import PricingPage from './pages/PricingPage'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import ForeclosurePage from './pages/ForeclosurePage'
import ContractsPage from './pages/ContractsPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import CookiesPolicyPage from './pages/CookiesPolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'
import BookConsultation from './pages/BookConsultation'
import LoanApplication from './pages/LoanApplication'
import WhatWeDoPage from './pages/WhatWeDoPage'
import ContactPage from './pages/ContactPage'
// New content pages
import SuccessStoriesPage from './pages/SuccessStoriesPage'
import BlogPage from './pages/BlogPage'
import BlogPostDetail from './pages/BlogPostDetail'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ResourcesPage from './pages/ResourcesPage'
import VideosPage from './pages/VideosPage'
import HelpPage from './pages/HelpPage'
import ToolsCalculatorsPage from './pages/ToolsCalculatorsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ContractsLibraryPage from './pages/ContractsLibraryPage'
import UnsubscribePage from './pages/UnsubscribePage'
import SitemapPage from './pages/SitemapPage'
import DirectMailPage from './pages/DirectMailPage'
import ReportsPage from './pages/ReportsPage'
import CanvaTemplatesPage from './pages/CanvaTemplatesPage'
// Temporary: Using simple version to bypass circular dependency
// import AdminSMSDashboard from './pages/AdminSMSDashboard'
import AdminSMSDashboard from './pages/AdminSMSDashboardSimple'
import AdminBlogManagement from './pages/AdminBlogManagement'
import AdminCommentModeration from './components/AdminCommentModeration'
import AdminTemplateUpload from './pages/AdminTemplateUpload'
import TemplateAnalyticsDashboard from './pages/TemplateAnalyticsDashboard'
import UserFavoritesPage from './pages/UserFavoritesPage'
import TestPage from './pages/TestPage'

// State management
import { useAuthStore, fetchUserProfile } from './store/authStore'
import { supabase } from './lib/supabase'

// Dashboard Component
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RepMotivatedSeller
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your comprehensive real estate analysis platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Property Analysis
              </h3>
              <p className="text-gray-600">
                Analyze flip and rental properties with advanced calculations
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Foreclosure Help
              </h3>
              <p className="text-gray-600">
                Professional foreclosure assistance and consultation services
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wholesale Contracts
              </h3>
              <p className="text-gray-600">
                Generate professional wholesale real estate contracts
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Reports
              </h3>
              <p className="text-gray-600">
                Generate branded presentations and detailed reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, login, logout } = useAuthStore()

  // Check for existing session and listen for auth changes
  useEffect(() => {
    const initializeAuth = async () => {
      // Check initial session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 Initial session check:', session?.user?.email || 'No session')

      if (session?.user) {
        await updateUserProfile(session.user)
      }
    }

    // Helper function to update user profile in store
    const updateUserProfile = async (user: any) => {
      try {
        // Fetch user profile from profiles table
        const profile = await fetchUserProfile(user.id)

        if (profile) {
          console.log('✅ Loaded profile from database:', profile.email)
          login(profile)
        } else {
          // Fallback to user metadata if profile doesn't exist yet
          const metadata = user.user_metadata
          const fallbackProfile = {
            id: user.id,
            email: user.email || '',
            name: metadata?.name || user.email?.split('@')[0] || 'User',
            membershipTier: (metadata?.membershipTier || 'free') as 'free' | 'pro' | 'enterprise',
            stripeCustomerId: metadata?.stripeCustomerId,
            subscriptionId: metadata?.subscriptionId,
            subscriptionStatus: metadata?.subscriptionStatus,
          }
          console.log('✅ Using fallback profile:', fallbackProfile.email)
          login(fallbackProfile)
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error)
        // Fallback to basic user info
        login({
          id: user.id,
          email: user.email || '',
          name: user.email?.split('@')[0] || 'User',
          membershipTier: 'free',
        })
      }
    }

    // Initialize auth
    initializeAuth()

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No session')

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email)
        await updateUserProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out')
        logout()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed')
        await updateUserProfile(session.user)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [login, logout])

    return (
      <Elements stripe={stripePromise}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow pt-16">
            <Routes>
              {/* Home - redirect based on auth */}
              <Route
                path="/"
                element={isAuthenticated ? <Dashboard /> : <Homepage />}
              />

              {/* Auth */}
              <Route
                path="/auth"
                element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
              />
              <Route
                path="/auth/callback"
                element={<AuthCallback />}
              />

                {/* Public Routes */}
                <Route path="/what-we-do" element={<WhatWeDoPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/contact" element={<ContactPage />} />
              <Route path="/consultation" element={<BookConsultation />} />
              <Route path="/loan-application" element={<LoanApplication />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />

              {/* New Content Pages */}
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetail />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/tools" element={<ToolsCalculatorsPage />} />
              <Route path="/calculators" element={<ToolsCalculatorsPage />} />

              {/* Feature Routes */}
              <Route path="/foreclosure" element={<ForeclosurePage />} />
              <Route path="/questionnaire" element={<ForeclosurePage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/contracts-library" element={<ContractsLibraryPage />} />
                <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/direct-mail" element={<DirectMailPage />} />
              <Route path="/reports" element={<ReportsPage />} />`n              <Route path="/canva-templates" element={<CanvaTemplatesPage />} />              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin"
                element={isAuthenticated ? <AdminPage /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin/sms"
                element={isAuthenticated ? <AdminSMSDashboard /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin/blog"
                element={isAuthenticated ? <AdminBlogManagement /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin/comments"
                element={isAuthenticated ? <AdminCommentModeration /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin/template-upload"
                element={isAuthenticated ? <AdminTemplateUpload /> : <Navigate to="/auth" />}
              />
              <Route
                path="/admin/analytics"
                element={isAuthenticated ? <TemplateAnalyticsDashboard /> : <Navigate to="/auth" />}
              />
              
              {/* User Routes */}
              <Route
                path="/favorites"
                element={isAuthenticated ? <UserFavoritesPage /> : <Navigate to="/auth" />}
              />

              {/* Temporary test route - no auth required */}
              <Route
                path="/test-sms"
                element={<AdminSMSDashboard />}
              />
              {/* Ultra-minimal test - try different paths */}
              <Route
                path="/test"
                element={<div style={{padding: '20px'}}><h1>INLINE TEST WORKS!</h1><p>Route is functional</p></div>}
              />
              <Route
                path="/simple"
                element={<div><h1>SIMPLE ROUTE</h1></div>}
              />
              <Route
                path="/sms-test"
                element={<div><h1>SMS TEST</h1></div>}
              />
              <Route
                path="/profile"
                element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Footer />

          <Toaster position="top-right" />
        </div>
      </Router>
    </Elements>
  )
}

export default App







