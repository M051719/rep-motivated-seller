import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Users, FileText, Building2, DollarSign, Calculator, 
  BookOpen, Video, HelpCircle, Mail, Phone, Shield, Cookie,
  FileCheck, MessageSquare, Briefcase, TrendingUp, Award,
  Database, BarChart, Settings, UserCog, MessageCircle, Palette
} from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

interface SitemapLink {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface SitemapSection {
  title: string;
  links: SitemapLink[];
}

const SitemapPage: React.FC = () => {
  const sections: SitemapSection[] = [
    {
      title: 'Main Pages',
      links: [
        { path: '/', label: 'Home', icon: <Home className="w-5 h-5" />, description: 'Main landing page' },
        { path: '/what-we-do', label: 'What We Do', icon: <Briefcase className="w-5 h-5" />, description: 'Our services and solutions' },
        { path: '/pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5" />, description: 'Pricing plans and tiers' },
        { path: '/contact', label: 'Contact', icon: <Mail className="w-5 h-5" />, description: 'Get in touch with us' },
      ]
    },
    {
      title: 'Dashboards',
      links: [
        { path: '/dashboard', label: 'My Dashboard', icon: <BarChart className="w-5 h-5" />, description: 'Personal dashboard' },
        { path: '/admin', label: 'Admin Dashboard', icon: <UserCog className="w-5 h-5" />, description: 'Administrative controls' },
        { path: '/admin-sms', label: 'SMS Dashboard', icon: <MessageCircle className="w-5 h-5" />, description: 'SMS campaign management' },
        { path: '/profile', label: 'Profile', icon: <Users className="w-5 h-5" />, description: 'User profile settings' },
      ]
    },
    {
      title: 'Services',
      links: [
        { path: '/foreclosure', label: 'Foreclosure Assistance', icon: <Building2 className="w-5 h-5" />, description: 'Help for property foreclosure' },
        { path: '/consultation', label: 'Book Consultation', icon: <Phone className="w-5 h-5" />, description: 'Schedule a consultation' },
        { path: '/loan-application', label: 'Loan Application', icon: <FileCheck className="w-5 h-5" />, description: 'Apply for financing' },
        { path: '/subscription', label: 'Subscription Plans', icon: <Award className="w-5 h-5" />, description: 'Membership options' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { path: '/contracts', label: 'Contracts', icon: <FileText className="w-5 h-5" />, description: 'Contract templates' },
        { path: '/contracts-library', label: 'Contracts Library', icon: <Database className="w-5 h-5" />, description: 'Browse all contracts' },
        { path: '/knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="w-5 h-5" />, description: 'Educational resources' },
        { path: '/resources', label: 'Resources', icon: <Briefcase className="w-5 h-5" />, description: 'Tools and materials' },
        { path: '/videos', label: 'Videos', icon: <Video className="w-5 h-5" />, description: 'Video tutorials' },
        { path: '/blog', label: 'Blog', icon: <FileText className="w-5 h-5" />, description: 'Latest articles' },
      ]
    },
    {
      title: 'Tools & Calculators',
      links: [
        { path: '/calculators', label: 'Deal Analysis Tools', icon: <Calculator className="w-5 h-5" />, description: 'Financial calculators' },
        { path: '/canva-templates', label: 'Canva Templates', icon: <Palette className="w-5 h-5" />, description: 'Design marketing materials' },
        { path: '/direct-mail', label: 'Direct Mail', icon: <Mail className="w-5 h-5" />, description: 'Send postcards and letters' },
        { path: '/reports', label: 'Reports', icon: <FileText className="w-5 h-5" />, description: 'Generate property reports' },
      ]
    },
    {
      title: 'Success & Community',
      links: [
        { path: '/success-stories', label: 'Success Stories', icon: <Award className="w-5 h-5" />, description: 'Client testimonials' },
        { path: '/help', label: 'Help Center', icon: <HelpCircle className="w-5 h-5" />, description: 'Get support' },
      ]
    },
    {
      title: 'Legal & Policies',
      links: [
        { path: '/privacy-policy', label: 'Privacy Policy', icon: <Shield className="w-5 h-5" />, description: 'Privacy & data protection' },
        { path: '/terms-of-service', label: 'Terms of Service', icon: <FileCheck className="w-5 h-5" />, description: 'Terms and conditions' },
        { path: '/refund-policy', label: 'Return & Refund Policy', icon: <DollarSign className="w-5 h-5" />, description: 'Refund information' },
        { path: '/cookies-policy', label: 'Cookies Policy', icon: <Cookie className="w-5 h-5" />, description: 'Cookie usage' },
        { path: '/disclaimer', label: 'Disclaimer', icon: <FileText className="w-5 h-5" />, description: 'Legal disclaimers' },
      ]
    },
    {
      title: 'Communication',
      links: [
        { path: '/unsubscribe', label: 'Unsubscribe', icon: <Mail className="w-5 h-5" />, description: 'Manage email preferences' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Map</h1>
          <p className="text-xl text-gray-600">
            Navigate to any section of RepMotivatedSeller
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <div className="text-blue-600 mt-0.5 group-hover:text-blue-700">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {link.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;


