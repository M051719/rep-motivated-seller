// src/pages/LegalPages.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Shield, FileText, Cookie, AlertTriangle, RefreshCw, ChevronRight, Home, X, Settings } from 'lucide-react';

// Legal Router Component
export const LegalRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/legal/privacy" replace />} />
    <Route path="/privacy" element={<PrivacyPolicyPage />} />
    <Route path="/terms" element={<TermsConditionsPage />} />
    <Route path="/cookies" element={<CookiesPolicyPage />} />
    <Route path="/disclaimer" element={<DisclaimerPage />} />
    <Route path="/refunds" element={<ReturnRefundPage />} />
  </Routes>
);

// Legal Footer Component
export const LegalFooter: React.FC = () => (
  <footer className="bg-gray-900 text-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <Link to="/legal/privacy" className="hover:text-gray-300">Privacy Policy</Link>
        <Link to="/legal/terms" className="hover:text-gray-300">Terms & Conditions</Link>
        <Link to="/legal/cookies" className="hover:text-gray-300">Cookies Policy</Link>
        <Link to="/legal/disclaimer" className="hover:text-gray-300">Disclaimer</Link>
        <Link to="/legal/refunds" className="hover:text-gray-300">Refund Policy</Link>
      </div>
      <div className="text-center mt-4 text-gray-400 text-sm">
        © 2025 RepMotivatedSeller. All rights reserved.
      </div>
    </div>
  </footer>
);

// Legal Page Layout Interface
interface LegalPageLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  lastUpdated?: string;
}

// Legal Page Layout Component
const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ 
  title, 
  icon, 
  children, 
  lastUpdated = "January 1, 2025" 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>Home</span>
          <ChevronRight className="h-4 w-4" />
          <span>Legal</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{title}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              {icon}
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-700">{lastUpdated}</p>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Table of Contents Component
const TableOfContents: React.FC<{ sections: { id: string; title: string; level: number }[] }> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-8 bg-gray-50 rounded-lg p-4 mb-8">
      <h3 className="font-semibold text-gray-900 mb-3">Table of Contents</h3>
      <nav>
        <ul className="space-y-2">
          {sections.map(({ id, title, level }) => (
            <li key={id} className={`${level > 1 ? 'ml-4' : ''}`}>
              <a
                href={`#${id}`}
                className={`block text-sm hover:text-blue-600 transition-colors ${
                  activeSection === id 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Contact Info Props Interface
interface ContactInfoProps {
  title?: string;
  email: string;
  phone?: string;
  address?: string;
  department?: string;
  className?: string;
}

// Contact Info Component
const ContactInfo: React.FC<ContactInfoProps> = ({
  title = "Contact Information",
  email,
  phone,
  address,
  department,
  className = "bg-gray-50 p-4 rounded-lg"
}) => (
  <div className={className}>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <div className="space-y-1">
      <p><strong>RepMotivatedSeller</strong></p>
      {department && <p><em>{department}</em></p>}
      <p>
        <span className="text-gray-600">Email:</span>{' '}
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
          {email}
        </a>
      </p>
      {phone && (
        <p>
          <span className="text-gray-600">Phone:</span>{' '}
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-blue-600 hover:underline">
            {phone}
          </a>
        </p>
      )}
      {address && <p><span className="text-gray-600">Address:</span> {address}</p>}
    </div>
  </div>
);

// Print Button Component
const PrintButton: React.FC = () => (
  <button
    onClick={() => window.print()}
    className="no-print mb-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
  >
    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
    Print
  </button>
);

// Privacy Policy Page
export const PrivacyPolicyPage: React.FC = () => {
  const sections = [
    { id: 'information-collection', title: 'Information We Collect', level: 1 },
    { id: 'information-use', title: 'How We Use Information', level: 1 },
    { id: 'information-sharing', title: 'Information Sharing', level: 1 },
    { id: 'data-security', title: 'Data Security', level: 1 },
    { id: 'your-rights', title: 'Your Rights', level: 1 },
    { id: 'gdpr-rights', title: 'GDPR Rights (EU Residents)', level: 2 },
    { id: 'ccpa-rights', title: 'CCPA Rights (California Residents)', level: 2 },
    { id: 'data-retention', title: 'Data Retention', level: 1 },
    { id: 'international-transfers', title: 'International Data Transfers', level: 1 },
    { id: 'contact', title: 'Contact Information', level: 1 }
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      icon={<Shield className="h-8 w-8 text-blue-600 mr-3" />}
      lastUpdated="January 15, 2025"
    >
      <PrintButton />
      <TableOfContents sections={sections} />
      
      <div className="space-y-8">
        <section id="information-collection">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="font-medium text-blue-900 mb-2">Personal Information You Provide</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800">Contact Details:</h4>
                  <ul className="list-disc list-inside ml-2 text-blue-700">
                    <li>Full name and preferred name</li>
                    <li>Email address</li>
                    <li>Phone numbers (mobile, home)</li>
                    <li>Mailing address</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Property Information:</h4>
                  <ul className="list-disc list-inside ml-2 text-blue-700">
                    <li>Property address and details</li>
                    <li>Mortgage information</li>
                    <li>Property value estimates</li>
                    <li>Foreclosure timeline</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h3 className="font-medium text-green-900 mb-2">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages viewed, time spent, click patterns</li>
                <li><strong>Location Data:</strong> General geographic location (city/state level)</li>
                <li><strong>Referral Information:</strong> Source of website visit</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="gdpr-rights" className="print-break">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">GDPR Rights (EU Residents)</h3>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <p className="text-purple-800 mb-3">Under GDPR, EU residents have additional rights:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside text-purple-700 space-y-1">
                <li><strong>Right to Access:</strong> Request copies of your data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict:</strong> Limit how we process your data</li>
              </ul>
              <ul className="list-disc list-inside text-purple-700 space-y-1">
                <li><strong>Right to Portability:</strong> Transfer your data</li>
                <li><strong>Right to Object:</strong> Opt-out of certain processing</li>
                <li><strong>Right to Withdraw Consent:</strong> At any time</li>
                <li><strong>Right to Complain:</strong> To supervisory authorities</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="ccpa-rights">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">CCPA Rights (California Residents)</h3>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 mb-3">California residents have the right to:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Know what personal information we collect and how it's used</li>
              <li>Request deletion of personal information</li>
              <li>Opt-out of the sale of personal information</li>
              <li>Non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="text-yellow-800 mt-3 font-medium">
              Note: We do not sell personal information to third parties.
            </p>
          </div>
        </section>
      </div>

      <ContactInfo
        title="Privacy & Data Protection Contact"
        email="privacy@repmotivatedseller.com"
        phone="1-800-REP-HELP (Press 2 for Privacy)"
        department="Data Protection Officer"
        className="bg-gray-100 border border-gray-300 p-6 rounded-lg"
      />
    </LegalPageLayout>
  );
};

// Terms & Conditions Page
export const TermsConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using RepMotivatedSeller services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p>RepMotivatedSeller provides:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Foreclosure assistance and consultation services</li>
                <li>Connection with real estate professionals and attorneys</li>
                <li>Educational resources and market information</li>
                <li>Lead generation services for real estate professionals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p>Users agree to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate and truthful information</li>
                <li>Use services for lawful purposes only</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to harm or disrupt our systems</li>
                <li>Maintain confidentiality of account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Professional Services Disclaimer</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-yellow-800">
                  <strong>Important:</strong> RepMotivatedSeller is not a law firm and does not provide legal advice. 
                  We connect you with licensed professionals who can provide appropriate guidance for your situation.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookies Policy Page
export const CookiesPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <Cookie className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Cookies Policy</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how our site is used.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Disclaimer Page
export const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <AlertTriangle className="h-8 w-8 text-amber-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Disclaimer</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-8">
              <p className="text-red-800 font-medium">
                <strong>Important Legal Notice:</strong> Please read this disclaimer carefully before using our services.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">No Attorney-Client Relationship</h2>
              <p>RepMotivatedSeller is not a law firm. Use of our services does not create an attorney-client relationship. We provide information and connections to licensed professionals, but do not provide legal advice.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Return & Refund Policy Page
export const ReturnRefundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-8">
            <RefreshCw className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p>RepMotivatedSeller is committed to providing valuable services. If you're not satisfied, we'll work to make it right.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie Consent Banner Interface
interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Cookie Consent Banner Component
export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">We use cookies</h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience and analyze site usage. 
                <a href="/legal/cookies" className="text-blue-600 hover:underline ml-1">
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-1 inline" />
                Settings
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Cookie Preferences</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Essential</h4>
                  <p className="text-sm text-gray-600">Required for basic functionality</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="h-4 w-4 text-blue-600"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Analytics</h4>
                  <p className="text-sm text-gray-600">Help us improve our website</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Marketing</h4>
                  <p className="text-sm text-gray-600">Personalized ads and content</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};