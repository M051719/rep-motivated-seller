import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Shield, User } from 'lucide-react';

interface DashboardNavigationProps {
  user: any;
  isAdmin?: boolean;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ user, isAdmin }) => {
  if (!user) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Dashboards
          </h2>
          <p className="text-gray-600">
            Access your personalized control centers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Member Dashboard - Always visible to authenticated users */}
          <Link
            to="/dashboard"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-500 transition-colors">
                <LayoutDashboard className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Member Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                View your account, subscriptions, and activity
              </p>
            </div>
          </Link>

          {/* Profile - Always visible to authenticated users */}
          <Link
            to="/profile"
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-500 transition-colors">
                <User className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                My Profile
              </h3>
              <p className="text-gray-600 text-sm">
                Update your personal information and settings
              </p>
            </div>
          </Link>

          {/* Admin Dashboard - Only visible to admins */}
          {isAdmin && (
            <Link
              to="/admin"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border-2 border-transparent hover:border-purple-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-500 transition-colors">
                  <Shield className="w-8 h-8 text-purple-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Admin Dashboard
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage users, content, and system settings
                </p>
              </div>
            </Link>
          )}

          {/* SMS Dashboard - Only visible to admins */}
          {isAdmin && (
            <Link
              to="/admin-sms"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border-2 border-transparent hover:border-orange-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-4 group-hover:bg-orange-500 transition-colors">
                  <MessageSquare className="w-8 h-8 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  SMS Dashboard
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage SMS campaigns and messaging
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
