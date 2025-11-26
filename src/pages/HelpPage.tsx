import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BackButton } from '../components/ui/BackButton';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Topics', icon: '❓' },
    { value: 'account', label: 'Account & Login', icon: '👤' },
    { value: 'foreclosure', label: 'Foreclosure Help', icon: '🏠' },
    { value: 'payment', label: 'Payments & Billing', icon: '💳' },
    { value: 'technical', label: 'Technical Issues', icon: '🔧' }
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: 'How do I create an account?',
      answer: 'Click the "Sign In" button in the top right corner, then select "Sign Up". Enter your email and create a password. You\'ll receive a confirmation email to activate your account.',
      category: 'account'
    },
    {
      id: 2,
      question: 'Is the foreclosure assessment really free?',
      answer: 'Yes! Our initial foreclosure assessment questionnaire is completely free with no obligation. We believe everyone deserves access to help when facing foreclosure.',
      category: 'foreclosure'
    },
    {
      id: 3,
      question: 'How quickly will I hear back after submitting my information?',
      answer: 'For urgent foreclosure cases, we respond within 24 hours. For general inquiries, you can expect a response within 1-2 business days.',
      category: 'foreclosure'
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. Payment plans are available for our services.',
      category: 'payment'
    },
    {
      id: 5,
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Sign In" then select "Forgot Password". Enter your email address and we\'ll send you a link to reset your password.',
      category: 'account'
    },
    {
      id: 6,
      question: 'What information do I need for the foreclosure questionnaire?',
      answer: 'Have ready: your property address, current mortgage balance, monthly payment amount, how far behind you are (if applicable), and your household income. Don\'t worry if you don\'t have everything - you can always update later.',
      category: 'foreclosure'
    },
    {
      id: 7,
      question: 'Is my information secure?',
      answer: 'Absolutely. We use bank-level encryption (SSL/TLS) to protect all your data. Your personal information is never shared with third parties without your explicit consent.',
      category: 'technical'
    },
    {
      id: 8,
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes. You can cancel your subscription at any time from your account settings. There are no cancellation fees, and you\'ll have access until the end of your current billing period.',
      category: 'payment'
    },
    {
      id: 9,
      question: 'The website is loading slowly. What should I do?',
      answer: 'Try clearing your browser cache, disabling browser extensions, or using a different browser. If problems persist, contact our support team at support@repmotivatedseller.com.',
      category: 'technical'
    },
    {
      id: 10,
      question: 'How do I update my account information?',
      answer: 'Log in and click your name in the top right corner, then select "Profile". You can update your email, password, phone number, and notification preferences.',
      category: 'account'
    },
    {
      id: 11,
      question: 'What makes your service different from other foreclosure help?',
      answer: 'We combine 24/7 AI assistance, expert human support, comprehensive education, and a caring community. We don\'t just provide information - we walk with you through the entire process.',
      category: 'foreclosure'
    },
    {
      id: 12,
      question: 'Do you work with all types of properties?',
      answer: 'Yes! We help homeowners with single-family homes, condos, townhouses, and multi-family properties up to 4 units. We serve all 50 states.',
      category: 'foreclosure'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>Help Center - FAQs & Support | RepMotivatedSeller</title>
        <meta name="description" content="Get answers to frequently asked questions about foreclosure help, account management, and technical support." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">❓ Help Center</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Find answers to common questions or get personalized support
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl">
                  🔍
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Quick Help
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Link
                to="/foreclosure"
                className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🆘</div>
                <h3 className="font-bold text-gray-900 mb-2">Emergency Help</h3>
                <p className="text-sm text-gray-600">Facing foreclosure now?</p>
              </Link>

              <Link
                to="/consultation"
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📞</div>
                <h3 className="font-bold text-gray-900 mb-2">Book Call</h3>
                <p className="text-sm text-gray-600">Talk to an expert</p>
              </Link>

              <Link
                to="/resources"
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                <h3 className="font-bold text-gray-900 mb-2">Resources</h3>
                <p className="text-sm text-gray-600">Templates & guides</p>
              </Link>

              <a
                href="mailto:support@repmotivatedseller.com"
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">✉️</div>
                <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-sm text-gray-600">Get direct support</p>
              </a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform ${
                        expandedFAQ === faq.id ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No questions found matching your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here for you
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                <a href="tel:+18778064677" className="text-blue-600 font-semibold hover:underline">
                  (877) 806-4677
                </a>
                <p className="text-sm text-gray-600 mt-2">Mon-Fri 9AM-5PM PT</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                <div className="text-4xl mb-3">✉️</div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:support@repmotivatedseller.com" className="text-green-600 font-semibold hover:underline break-all">
                  support@repmotivatedseller.com
                </a>
                <p className="text-sm text-gray-600 mt-2">Response within 24hrs</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
                <button className="text-purple-600 font-semibold hover:underline">
                  Start Chat
                </button>
                <p className="text-sm text-gray-600 mt-2">Available 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Facing Foreclosure?</h2>
            <p className="text-xl mb-8">
              Don't wait - get the help you need today
            </p>
            <Link
              to="/foreclosure"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Get Immediate Help
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default HelpPage;
