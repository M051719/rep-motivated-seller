import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type { User } from "../../types";
import { toast } from "react-hot-toast";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial user and admin status
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user as User);

      if (user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profile?.is_admin) {
          setIsAdmin(true);
        }
      }
    };

    loadUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser((session?.user as User) || null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully signed out');
      setUser(null);
      setIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-xl text-gray-900">
                RepMotivatedSeller
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              🏠 Home
            </Link>
            <Link
              to="/foreclosure"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/foreclosure")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              🆘 Get Help
            </Link>
            <Link
              to="/fsbo-listing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/fsbo-listing")
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              🏡 Free FSBO Listing
            </Link>
            {/* Education Dropdown */}
            <div className="relative group">
              <Link
                to="/education"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/education")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                🎓 Education
              </Link>

              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    to="/education"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📚 Course Library
                  </Link>
                  {user && (
                    <>
                      <Link
                        to="/education/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📊 My Dashboard
                      </Link>
                      <Link
                        to="/education/analytics"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        📈 Analytics
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/marketing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/marketing')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              📬 Marketing
            </Link>
            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                📚 Resources
              </button>

              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    to="/success-stories"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🏆 Success Stories
                  </Link>
                  <Link
                    to="/blog"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📝 Blog
                  </Link>
                  <Link
                    to="/knowledge-base"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📚 Knowledge Base
                  </Link>
                  <Link
                    to="/resources"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📋 Templates & Forms
                  </Link>
                  <Link
                    to="/tools"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🔧 Calculators & Tools
                  </Link>
                  <Link
                    to="/videos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🎬 Video Library
                  </Link>
                </div>
              </div>
            </div>
            <Link
              to="/subscription"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              👑 Subscription
            </Link>
            <Link
              to="/help"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              ❓ Help
            </Link>{" "}
            <Link
              to="/contact"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              📞 Contact
            </Link>
            {/* Admin Menu (only for admins) */}
            {user && isAdmin && (
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  ⚡ Admin
                </button>

                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/admin/sms"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      💬 SMS Monitoring
                    </Link>
                    <Link
                      to="/admin/blog"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ✍️ Blog Management
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <span className="text-2xl">👤</span>
                  <span className="text-sm">Account</span>
                </button>

                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      👑 Subscription & Billing
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 Dashboard
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:bg-red-50 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                🔐 Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  🏠 Home
                </Link>
                <Link
                  to="/foreclosure"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  🆘 Get Help
                </Link>
                <Link
                  to="/education"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  🎓 Education
                </Link>
                {user && (
                  <Link
                    to="/education/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                    onClick={() => setIsOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                )}
                <Link
                  to="/marketing"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  📬 Marketing
                </Link>

                <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Resources
                </div>
                <Link
                  to="/success-stories"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  🏆 Success Stories
                </Link>
                <Link
                  to="/blog"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  📝 Blog
                </Link>
                <Link
                  to="/knowledge-base"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  📚 Knowledge Base
                </Link>
                <Link
                  to="/resources"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  📋 Templates & Forms
                </Link>
                <Link
                  to="/tools"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  🔧 Calculators & Tools
                </Link>
                <Link
                  to="/videos"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 ml-4"
                  onClick={() => setIsOpen(false)}
                >
                  🎬 Video Library
                </Link>

                <Link
                  to="/subscription"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  👑 Subscription
                </Link>
                <Link
                  to="/help"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  ❓ Help
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  📞 Contact
                </Link>
                {user && isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      ⚡ Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/sms"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      💬 SMS Monitoring
                    </Link>
                    <Link
                      to="/admin/blog"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      ✍️ Blog Management
                    </Link>
                  </>
                )}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/subscription"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      👑 Subscription
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    🔐 Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
