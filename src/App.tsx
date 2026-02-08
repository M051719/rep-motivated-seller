import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "./lib/stripe";
import { Toaster } from "react-hot-toast";

// Layout components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import AIAssistant from "./components/AIAssistant";
import FloatingAIChat from "./components/FloatingAIChat";

// Critical pages - loaded synchronously for auth redirects and initial page load
import Homepage from "./pages/homepage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";

// Security components
import SecurityHeaders from "./components/security/SecurityHeaders";

// Lazy-loaded pages - loaded on demand to reduce initial bundle size
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const ForeclosurePage = React.lazy(() => import("./pages/ForeclosurePage"));
const ContractsPage = React.lazy(() => import("./pages/ContractsPage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfServicePage"));
const RefundPolicyPage = React.lazy(() => import("./pages/RefundPolicyPage"));
const CookiesPolicyPage = React.lazy(() => import("./pages/CookiesPolicyPage"));
const DisclaimerPage = React.lazy(() => import("./pages/DisclaimerPage"));
const BookConsultation = React.lazy(() => import("./pages/BookConsultation"));
const LoanApplication = React.lazy(() => import("./pages/LoanApplication"));
const WhatWeDoPage = React.lazy(() => import("./pages/WhatWeDoPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const SuccessStoriesPage = React.lazy(() => import("./pages/SuccessStoriesPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogPostDetail = React.lazy(() => import("./pages/BlogPostDetail"));
const KnowledgeBasePage = React.lazy(() => import("./pages/KnowledgeBasePage"));
const ResourcesPage = React.lazy(() => import("./pages/ResourcesPage"));
const VideosPage = React.lazy(() => import("./pages/VideosPage"));
const HelpPage = React.lazy(() => import("./pages/HelpPage"));
const OnlineVoicesEbook = React.lazy(() => import("./pages/OnlineVoicesEbook"));
const CalculatorsPage = React.lazy(() => import("./pages/CalculatorsPage"));
const SubscriptionPage = React.lazy(() => import("./pages/SubscriptionPage"));
const ContractsLibraryPage = React.lazy(() => import("./pages/ContractsLibraryPage"));
const UnsubscribePage = React.lazy(() => import("./pages/UnsubscribePage"));
const SitemapPage = React.lazy(() => import("./pages/SitemapPage"));
const DirectMailPage = React.lazy(() => import("./pages/DirectMailPage"));
const AIChatPage = React.lazy(() => import("./pages/AIChatPage"));
const ReportsPage = React.lazy(() => import("./pages/ReportsPage"));
const CanvaTemplatesPage = React.lazy(() => import("./pages/CanvaTemplatesPage"));
const GLBACompliancePage = React.lazy(() => import("./pages/GLBACompliancePage"));
const PCIDSSCompliancePage = React.lazy(() => import("./pages/PCIDSSCompliancePage"));
const CreditRepairLanding = React.lazy(() => import("./pages/credit-repair/CreditRepairLanding"));
const CreditRepairDashboard = React.lazy(() => import("./pages/credit-repair/CreditRepairDashboard"));
const PropertyInventory = React.lazy(() => import("./pages/PropertyInventory"));
const PropertyDetail = React.lazy(() => import("./pages/PropertyDetail"));
const FSBOListing = React.lazy(() => import("./pages/FSBOListing"));
const EducationDashboard = React.lazy(() => import("./pages/EducationDashboard"));
const SchedulingDashboard = React.lazy(() => import("./pages/SchedulingDashboard"));
const DirectMailMarketingDashboard = React.lazy(() => import("./pages/DirectMailMarketingDashboard"));
const AdminSMSDashboard = React.lazy(() => import("./pages/AdminSMSDashboardSimple"));
const AdminBlogManagement = React.lazy(() => import("./pages/AdminBlogManagement"));
const AdminCommentModeration = React.lazy(() => import("./components/AdminCommentModeration"));
const AdminTemplateUpload = React.lazy(() => import("./pages/AdminTemplateUpload"));
const AdminKnowledgeBase = React.lazy(() => import("./pages/AdminKnowledgeBase"));
const TemplateAnalyticsDashboard = React.lazy(() => import("./pages/TemplateAnalyticsDashboard"));
const UserFavoritesPage = React.lazy(() => import("./pages/UserFavoritesPage"));
const TestPage = React.lazy(() => import("./pages/TestPage"));
const MarketingDashboard = React.lazy(() => import("./pages/MarketingDashboard"));
const SecurityDashboard = React.lazy(() => import("./components/security/SecurityDashboard"));

// Heavy library pages - lazy loaded to reduce bundle size (ExcelJS, jsPDF, pptxgenjs)
const PresentationBuilderPage = React.lazy(() => import("./pages/PresentationBuilderPage"));
const HardshipLetterGenerator = React.lazy(() => import("./pages/HardshipLetterGenerator"));
const DealPresentationOutlinePage = React.lazy(() => import("./pages/DealPresentationOutlinePage"));
const InstitutionalDashboardPage = React.lazy(() => import("./pages/InstitutionalDashboardPage"));

// State management
import { useAuthStore, fetchUserProfile } from "./store/authStore";
import { supabase } from "./lib/supabase";

// Loading fallback component for lazy-loaded routes
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

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
  );
};

function App() {
  const { isAuthenticated, login, logout } = useAuthStore();

  // Check for existing session and listen for auth changes
  useEffect(() => {
    const initializeAuth = async () => {
      // Check initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "🔐 Initial session check:",
        session?.user?.email || "No session",
      );

      if (session?.user) {
        await updateUserProfile(session.user);
      }
    };

    // Helper function to update user profile in store
    const updateUserProfile = async (user: any) => {
      try {
        // Fetch user profile from profiles table
        const profile = await fetchUserProfile(user.id);

        if (profile) {
          console.log("✅ Loaded profile from database:", profile.email);
          login(profile);
        } else {
          // Fallback to user metadata if profile doesn't exist yet
          const metadata = user.user_metadata;
          const fallbackProfile = {
            id: user.id,
            email: user.email || "",
            name: metadata?.name || user.email?.split("@")[0] || "User",
            membershipTier: (metadata?.membershipTier || "free") as
              | "free"
              | "pro"
              | "enterprise",
            stripeCustomerId: metadata?.stripeCustomerId,
            subscriptionId: metadata?.subscriptionId,
            subscriptionStatus: metadata?.subscriptionStatus,
          };
          console.log("✅ Using fallback profile:", fallbackProfile.email);
          login(fallbackProfile);
        }
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        // Fallback to basic user info
        login({
          id: user.id,
          email: user.email || "",
          name: user.email?.split("@")[0] || "User",
          membershipTier: "free",
        });
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔄 Auth state changed:",
        event,
        session?.user?.email || "No session",
      );

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email);
        await updateUserProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out");
        logout();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed");
        await updateUserProfile(session.user);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout]);

  return (
    <Elements stripe={stripePromise}>
      <SecurityHeaders />
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow pt-16">
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/signup"
                  element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
                />
              {/* Public Routes */}
              <Route path="/what-we-do" element={<WhatWeDoPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/education/dashboard"
                element={<EducationDashboard />}
              />
              <Route path="/scheduling" element={<SchedulingDashboard />} />
              <Route
                path="/marketing/direct-mail"
                element={<DirectMailMarketingDashboard />}
              />
              <Route path="/consultation" element={<BookConsultation />} />
              <Route path="/loan-application" element={<LoanApplication />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/compliance/glba" element={<GLBACompliancePage />} />
              <Route
                path="/compliance/pci-dss"
                element={<PCIDSSCompliancePage />}
              />
              <Route
                path="/terms-of-service"
                element={<TermsOfServicePage />}
              />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              {/* New Content Pages */}
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetail />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route
                path="/ebooks/online-voices"
                element={<OnlineVoicesEbook />}
              />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/help" element={<HelpPage />} />
              {/* Credit Repair Service */}
              <Route path="/credit-repair" element={<CreditRepairLanding />} />
              <Route
                path="/credit-repair/dashboard"
                element={<CreditRepairDashboard />}
              />
              <Route path="/tools" element={<CalculatorsPage />} />
              <Route path="/calculators" element={<CalculatorsPage />} />
              {/* Feature Routes */}
              <Route path="/foreclosure" element={<ForeclosurePage />} />
              <Route path="/questionnaire" element={<ForeclosurePage />} />
              <Route
                path="/hardship-letter-generator"
                element={<HardshipLetterGenerator />}
              />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route
                path="/contracts-library"
                element={<ContractsLibraryPage />}
              />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/direct-mail" element={<DirectMailPage />} />
              <Route
                path="/institutional-dashboard"
                element={<InstitutionalDashboardPage />}
              />
              <Route
                path="/deal-presentation"
                element={<DealPresentationOutlinePage />}
              />
              <Route
                path="/presentation-builder"
                element={<PresentationBuilderPage />}
              />
              <Route
                path="/property-inventory"
                element={<PropertyInventory />}
              />
              <Route
                path="/property-inventory/:id"
                element={<PropertyDetail />}
              />
              <Route path="/fsbo-listing" element={<FSBOListing />} />
              <Route path="/ai-chat" element={<AIChatPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              <Route path="/canva-templates" element={<CanvaTemplatesPage />} />

              {/* Security Dashboard (Development Only) */}
              {import.meta.env.DEV && (
                <Route path="/security" element={<SecurityDashboard />} />
              )}

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/admin"
                element={
                  isAuthenticated ? <AdminPage /> : <Navigate to="/auth" />
                }
              />
              <Route
                path="/admin/sms"
                element={
                  isAuthenticated ? (
                    <AdminSMSDashboard />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/admin/blog"
                element={
                  isAuthenticated ? (
                    <AdminBlogManagement />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/admin/comments"
                element={
                  isAuthenticated ? (
                    <AdminCommentModeration />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/admin/template-upload"
                element={
                  isAuthenticated ? (
                    <AdminTemplateUpload />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  isAuthenticated ? (
                    <TemplateAnalyticsDashboard />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/admin/knowledge-base"
                element={
                  isAuthenticated ? (
                    <AdminKnowledgeBase />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              {/* User Routes */}
              <Route
                path="/favorites"
                element={
                  isAuthenticated ? (
                    <UserFavoritesPage />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              {/* Temporary test route - no auth required */}
              <Route path="/test-sms" element={<AdminSMSDashboard />} />
              {/* Ultra-minimal test - try different paths */}
              <Route
                path="/test"
                element={
                  <div style={{ padding: "20px" }}>
                    <h1>INLINE TEST WORKS!</h1>
                    <p>Route is functional</p>
                  </div>
                }
              />
              <Route
                path="/simple"
                element={
                  <div>
                    <h1>SIMPLE ROUTE</h1>
                  </div>
                }
              />
              <Route
                path="/sms-test"
                element={
                  <div>
                    <h1>SMS TEST</h1>
                  </div>
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />
                }
              />
              <Route path="/marketing" element={<MarketingDashboard />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </Suspense>
          </main>

          <Footer />

          <Toaster position="top-right" />

          {/* Floating AI Chat Button - Persistent across all pages */}
          <FloatingAIChat />
        </div>
      </Router>
    </Elements>
  );
}

export default App;
