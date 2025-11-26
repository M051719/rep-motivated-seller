import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BackButton } from '../components/ui/BackButton';

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

  const categories = [
    { value: 'all', label: 'All Topics', icon: '📚' },
    { value: 'foreclosure', label: 'Foreclosure Process', icon: '🏠' },
    { value: 'legal', label: 'Legal Rights', icon: '⚖️' },
    { value: 'financial', label: 'Financial Options', icon: '💰' },
    { value: 'resources', label: 'Resources', icon: '📋' }
  ];

  const articles: Article[] = [
    {
      id: 1,
      title: 'What is Foreclosure?',
      description: 'Understanding the foreclosure process from start to finish',
      category: 'foreclosure',
      icon: '🏠'
    },
    {
      id: 2,
      title: 'Your Legal Rights During Foreclosure',
      description: 'Know your rights and protections under state and federal law',
      category: 'legal',
      icon: '⚖️'
    },
    {
      id: 3,
      title: 'Loan Modification Options',
      description: 'How to modify your mortgage to make payments affordable',
      category: 'financial',
      icon: '💰'
    },
    {
      id: 4,
      title: 'Short Sale Process',
      description: 'When and how to pursue a short sale as an alternative',
      category: 'financial',
      icon: '🤝'
    },
    {
      id: 5,
      title: 'Foreclosure Timeline by State',
      description: 'State-specific foreclosure processes and timelines',
      category: 'foreclosure',
      icon: '📅'
    },
    {
      id: 6,
      title: 'Government Assistance Programs',
      description: 'Federal and state programs that can help homeowners',
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
                  <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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
