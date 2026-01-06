/**
 * Admin Knowledge Base Manager
 * Add, edit, and manage educational articles
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tier_level: 'basic' | 'premium' | 'elite';
  keywords: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'pre-foreclosure-basics', label: 'Pre-Foreclosure Basics' },
  { value: 'credit-repair-fundamentals', label: 'Credit Repair Fundamentals' },
  { value: 'real-estate-investing-101', label: 'Real Estate Investing 101' },
  { value: 'property-analysis', label: 'Property Analysis' },
  { value: 'deal-evaluation', label: 'Deal Evaluation' },
  { value: 'market-insights', label: 'Market Insights' },
  { value: 'document-generation', label: 'Document Generation' },
  { value: 'calculators', label: 'Calculators' },
  { value: 'roi-analysis', label: 'ROI Analysis' },
  { value: '1-percent-rule', label: '1% Rule' },
  { value: 'dscr-analysis', label: 'DSCR Analysis' },
  { value: 'direct-mail', label: 'Direct Mail' },
  { value: 'wholesale-contracts', label: 'Wholesale Contracts' },
  { value: 'fix-flip-strategies', label: 'Fix & Flip Strategies' },
  { value: 'legal-guides', label: 'Legal Guides' }
];

export default function AdminKnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'real-estate-investing-101',
    tier_level: 'basic' as 'basic' | 'premium' | 'elite',
    keywords: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Title, content, and category are required');
      return;
    }

    try {
      const articleData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 200).replace(/#+/g, '').trim(),
        category: formData.category,
        tier_level: formData.tier_level,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        status: formData.status,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (formData.id) {
        // Update existing
        const { error } = await supabase
          .from('knowledge_base')
          .update(articleData)
          .eq('id', formData.id);

        if (error) throw error;
        toast.success('Article updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('knowledge_base')
          .insert([articleData]);

        if (error) throw error;
        toast.success('Article created successfully!');
      }

      setIsEditing(false);
      resetForm();
      fetchArticles();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Failed to save article');
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      tier_level: article.tier_level,
      keywords: article.keywords?.join(', ') || '',
      tags: article.tags?.join(', ') || '',
      status: article.status
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Article deleted successfully!');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'real-estate-investing-101',
      tier_level: 'basic',
      keywords: '',
      tags: '',
      status: 'draft'
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Admin</h1>
          <button
            onClick={() => {
              resetForm();
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Article
          </button>
        </div>

        {/* Editor Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {formData.id ? 'Edit Article' : 'New Article'}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter article title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL-friendly)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="auto-generated-from-title"
                />
              </div>

              {/* Category & Tier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Tier
                  </label>
                  <select
                    value={formData.tier_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier_level: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic (All Members)</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt (Short Summary)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description for search results..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (Markdown) *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="# Article Title

## Section 1
Your content here...

## Section 2
More content..."
                />
              </div>

              {/* Keywords & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="foreclosure, prevention, homeowner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="urgent, homeowner-help, basics"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft (Not visible)</option>
                  <option value="published">Published (Visible to users)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {formData.id ? 'Update Article' : 'Create Article'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No articles found. Create your first article!</p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.status === 'published' ? 'bg-green-100 text-green-700' :
                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {article.status === 'published' ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                        {article.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.tier_level === 'basic' ? 'bg-blue-100 text-blue-700' :
                        article.tier_level === 'premium' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {article.tier_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{CATEGORIES.find(c => c.value === article.category)?.label}</span>
                      <span>•</span>
                      <span>{article.view_count} views</span>
                      <span>•</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
