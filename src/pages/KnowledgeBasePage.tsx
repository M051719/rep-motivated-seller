import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BackButton } from '../components/ui/BackButton';
import MortgageModificationTemplate from '../components/MortgageModificationTemplate';

interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
}

const KnowledgeBasePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTemplate, setShowTemplate] = useState<boolean>(false);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '📚' },
    { value: 'foreclosure', label: 'Foreclosure Process', icon: '🏠' },
    { value: 'legal', label: 'Legal Rights', icon: '⚖️' },
    { value: 'financial', label: 'Financial Options', icon: '💰' },
    { value: 'resources', label: 'Resources', icon: '📋' }
  ];

  const ebookUrl = 'https://app.designrr.io/projectHtml/2543416?token=92d72d9af682795d175d98257208710f&mode=nice_preview';

  const articles: Article[] = [
    {
      id: 1,
      title: 'What is Pre-Foreclosure?',
      description: 'Pre-foreclosure is a critical stage before property is taken back by the lender. Learn about this wake-up call period and available options.',
      category: 'foreclosure',
      icon: '🏠'
    },
    {
      id: 2,
      title: 'Financial Counseling for Homeowners',
      description: 'Professional guidance and support during challenging times, including mortgage modifications and refinancing solutions.',
      category: 'financial',
      icon: '💼'
    },
    {
      id: 3,
      title: 'Mortgage Modification & Refinancing',
      description: 'Adjust your loan terms to create manageable payments and prevent foreclosure through modification or refinancing.',
      category: 'financial',
      icon: '💰'
    },
    {
      id: 4,
      title: 'Pre-Foreclosure Assistance for Seniors',
      description: 'Unique challenges for senior homeowners and specialized resources tailored to their needs.',
      category: 'resources',
      icon: '👴'
    },
    {
      id: 5,
      title: 'Short Sale Strategies',
      description: 'Sell your property for less than mortgage balance with lender approval to avoid foreclosure.',
      category: 'financial',
      icon: '🤝'
    },
    {
      id: 6,
      title: 'Real Estate Investment Opportunities',
      description: 'Identify investment opportunities and strategies for pre-foreclosure properties.',
      category: 'resources',
      icon: '📊'
    },
    {
      id: 7,
      title: 'Building a Support System',
      description: 'Community support, local resources, and the importance of connecting with others facing similar challenges.',
      category: 'resources',
      icon: '🤲'
    },
    {
      id: 8,
      title: 'Taking Action & Moving Forward',
      description: 'Create a personal action plan, stay motivated through challenges, and celebrate small wins along the way.',
      category: 'resources',
      icon: '🎯'
    },
    {
      id: 9,
      title: 'Your Legal Rights During Foreclosure',
      description: 'Know your rights and protections under state and federal law during the foreclosure process.',
      category: 'legal',
      icon: '⚖️'
    },
    {
      id: 10,
      title: 'Government Assistance Programs',
      description: 'Federal and state programs including HUD foreclosure help and CFPB resources.',
      category: 'resources',
      icon: '🏛️'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // If template is shown, render it instead of the knowledge base
  if (showTemplate) {
    return (
      <>
        <Helmet>
          <title>Chapter 3: Mortgage Modification Research Template | RepMotivatedSeller</title>
          <meta name="description" content="Interactive research template to help you organize information for your mortgage modification application." />
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 pt-8">
            <button
              onClick={() => setShowTemplate(false)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Knowledge Base
            </button>
          </div>
          <MortgageModificationTemplate />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Knowledge Base - Foreclosure Help Center | RepMotivatedSeller</title>
        <meta name="description" content="Comprehensive knowledge base on foreclosure prevention, legal rights, and financial options." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">📚 Knowledge Base</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Everything you need to know about foreclosure prevention and home saving strategies
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl">
                  🔍
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured: Chapter Templates */}
        <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Research Templates</h2>
              <p className="text-lg text-gray-600">Step-by-step guides to organize your information</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-2xl overflow-hidden cursor-pointer"
                onClick={() => setShowTemplate(true)}
              >
                <div className="p-8 text-white">
                  <div className="flex items-start gap-6">
                    <div className="text-6xl">📝</div>
                    <div className="flex-1">
                      <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                        NEW - Interactive Template
                      </div>
                      <h3 className="text-3xl font-bold mb-3">
                        Chapter 3: Mortgage Modification Research Template
                      </h3>
                      <p className="text-lg text-blue-100 mb-4">
                        A comprehensive, interactive form to help you organize all the information needed for your mortgage modification application. Save your progress, export to PDF, and ensure you have everything ready before contacting your lender.
                      </p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">7 Detailed Sections</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Auto-Save Feature</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Document Checklist</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Financial Calculators</span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Export & Print</span>
                      </div>
                      <div className="flex items-center gap-2 text-xl font-bold">
                        <span>Launch Template</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 px-8 py-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        20-30 minutes to complete
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Save & resume anytime
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coming Soon Templates */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 opacity-60">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🏠</span>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">COMING SOON</div>
                      <h4 className="font-bold text-gray-700">Chapter 1: Understanding Foreclosure</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Timeline tracker and options explorer</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 opacity-60">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">💼</span>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold">COMING SOON</div>
                      <h4 className="font-bold text-gray-700">Chapter 2: Financial Assessment</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Budget calculator and hardship analyzer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl mb-4">{article.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <a
                    href={ebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center"
                  >
                    Read Full Chapter
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No articles found matching your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* Government & Local Resources */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🏛️ Government & Local Resources</h2>
              <p className="text-xl text-gray-600">Official programs and services to help homeowners</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* HUD */}
              <motion.a
                href="https://www.hud.gov/topics/avoiding_foreclosure"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">HUD - Foreclosure Help</h3>
                <p className="text-gray-700 mb-3">U.S. Department of Housing and Urban Development foreclosure prevention resources</p>
                <span className="text-blue-600 font-semibold">Visit HUD.gov →</span>
              </motion.a>

              {/* CFPB */}
              <motion.a
                href="https://www.consumerfinance.gov/ask-cfpb/what-is-forbearance-en-289/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">CFPB - Consumer Protection</h3>
                <p className="text-gray-700 mb-3">Consumer Financial Protection Bureau - mortgage help and rights</p>
                <span className="text-green-600 font-semibold">Visit CFPB.gov →</span>
              </motion.a>

              {/* HOPE Hotline */}
              <motion.a
                href="https://www.995hope.org/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">☎️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">HOPE Hotline</h3>
                <p className="text-gray-700 mb-3">Free foreclosure counseling: Call 888-995-HOPE (4673)</p>
                <span className="text-red-600 font-semibold">Get Help Now →</span>
              </motion.a>

              {/* NeighborWorks */}
              <motion.a
                href="https://www.neighborworks.org/Get-Financial-Help/Find-a-Housing-Counselor"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🏘️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">NeighborWorks America</h3>
                <p className="text-gray-700 mb-3">Find HUD-approved housing counselors in your area</p>
                <span className="text-purple-600 font-semibold">Find Counselor →</span>
              </motion.a>

              {/* Making Home Affordable */}
              <motion.a
                href="https://www.makinghomeaffordable.gov/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🏡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Making Home Affordable</h3>
                <p className="text-gray-700 mb-3">Federal program for loan modifications and refinancing</p>
                <span className="text-orange-600 font-semibold">Learn More →</span>
              </motion.a>

              {/* Legal Aid */}
              <motion.a
                href="https://www.lawhelp.org/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">⚖️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">LawHelp.org</h3>
                <p className="text-gray-700 mb-3">Find free legal aid services in your state</p>
                <span className="text-teal-600 font-semibold">Find Legal Help →</span>
              </motion.a>

              {/* State Housing Agencies */}
              <motion.a
                href="https://www.ncsha.org/housing-help/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🗺️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">State Housing Agencies</h3>
                <p className="text-gray-700 mb-3">Connect with your state's housing finance agency</p>
                <span className="text-indigo-600 font-semibold">Find Your State →</span>
              </motion.a>

              {/* FHA Connection */}
              <motion.a
                href="https://www.fhaoutreach.gov/FHAOutreach/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">FHA Resource Center</h3>
                <p className="text-gray-700 mb-3">FHA loan information and loss mitigation options</p>
                <span className="text-pink-600 font-semibold">Visit FHA.gov →</span>
              </motion.a>

              {/* County Resources */}
              <motion.a
                href="https://www.usa.gov/local-governments"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="block p-6 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">📍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Local Government Services</h3>
                <p className="text-gray-700 mb-3">Find county and city resources in your area</p>
                <span className="text-gray-700 font-semibold">Find Local Help →</span>
              </motion.a>
            </div>

            {/* Additional Info */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Important Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Free Services:</strong> HUD-approved housing counseling is free. Beware of scams charging fees.</li>
                <li>• <strong>Act Quickly:</strong> Contact your lender immediately if you're having trouble making payments.</li>
                <li>• <strong>Know Your Rights:</strong> Federal and state laws protect homeowners during foreclosure.</li>
                <li>• <strong>Get Professional Help:</strong> Consult with approved housing counselors and attorneys.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* MCP Integrations - Developer Resources */}
        <section className="py-16 bg-gradient-to-br from-slate-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">🤖 AI Integration Resources (MCP)</h2>
              <p className="text-xl text-gray-300">Model Context Protocol integrations for Claude AI and development tools</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Claude Desktop */}
              <motion.a
                href="https://claude.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="text-lg font-bold mb-2">Claude Desktop</h3>
                <p className="text-sm text-purple-100 mb-3">AI assistant with MCP support</p>
                <span className="text-xs text-purple-200">Download →</span>
              </motion.a>

              {/* GitHub MCP */}
              <motion.a
                href="https://github.com/modelcontextprotocol"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">💻</div>
                <h3 className="text-lg font-bold mb-2">GitHub MCP</h3>
                <p className="text-sm text-gray-300 mb-3">Repository integration</p>
                <span className="text-xs text-gray-400">Visit GitHub →</span>
              </motion.a>

              {/* Cloudflare Workers */}
              <motion.a
                href="https://workers.cloudflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="text-lg font-bold mb-2">Cloudflare</h3>
                <p className="text-sm text-orange-100 mb-3">Edge computing platform</p>
                <span className="text-xs text-orange-200">Explore →</span>
              </motion.a>

              {/* Docker Hub */}
              <motion.a
                href="https://hub.docker.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">🐳</div>
                <h3 className="text-lg font-bold mb-2">Docker Hub</h3>
                <p className="text-sm text-blue-100 mb-3">Container registry</p>
                <span className="text-xs text-blue-200">Browse →</span>
              </motion.a>

              {/* Stripe API */}
              <motion.a
                href="https://stripe.com/docs/api"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-lg font-bold mb-2">Stripe API</h3>
                <p className="text-sm text-indigo-100 mb-3">Payment processing</p>
                <span className="text-xs text-indigo-200">Docs →</span>
              </motion.a>

              {/* OpenWeather API */}
              <motion.a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">🌤️</div>
                <h3 className="text-lg font-bold mb-2">OpenWeather</h3>
                <p className="text-sm text-sky-100 mb-3">Weather data API</p>
                <span className="text-xs text-sky-200">API Docs →</span>
              </motion.a>

              {/* StackHawk */}
              <motion.a
                href="https://www.stackhawk.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="text-lg font-bold mb-2">StackHawk</h3>
                <p className="text-sm text-green-100 mb-3">Security testing</p>
                <span className="text-xs text-green-200">Learn More →</span>
              </motion.a>

              {/* Dappier */}
              <motion.a
                href="https://dappier.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="block p-6 bg-gradient-to-br from-pink-600 to-rose-700 rounded-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="text-lg font-bold mb-2">Dappier</h3>
                <p className="text-sm text-pink-100 mb-3">AI data platform</p>
                <span className="text-xs text-pink-200">Explore →</span>
              </motion.a>
            </div>

            {/* MCP Info Box */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-400/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>🔌</span>
                <span>What is Model Context Protocol (MCP)?</span>
              </h3>
              <p className="text-gray-300 mb-4">
                MCP is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). 
                It enables seamless integration between AI assistants like Claude and external tools, databases, and APIs.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-300">For Developers</h4>
                  <p className="text-sm text-gray-400">Build AI-powered features with standardized integrations and real-time data access.</p>
                </div>
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-300">For Users</h4>
                  <p className="text-sm text-gray-400">Enhanced AI assistance with access to live data, tools, and platform-specific capabilities.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs">Real-time Data</span>
                <span className="px-3 py-1 bg-indigo-500/30 rounded-full text-xs">Tool Integration</span>
                <span className="px-3 py-1 bg-blue-500/30 rounded-full text-xs">API Connections</span>
                <span className="px-3 py-1 bg-cyan-500/30 rounded-full text-xs">Open Standard</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl mb-8">Get personalized help from our experts</p>
            <Link
              to="/foreclosure"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Get Help Now
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default KnowledgeBasePage;
