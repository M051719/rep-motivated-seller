import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import RichTextEditor from "../components/RichTextEditor";
import ImageUploader from "../components/ImageUploader";
import { BackButton } from "../components/ui/BackButton";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Search,
  Filter,
  Calendar,
  Tag,
  User,
  FileText,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string | null;
  author_name: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  published: boolean;
  published_at: string | null;
  read_time: string;
  views: number;
  created_at: string;
  updated_at: string;
}

const AdminBlogManagement: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPublished, setFilterPublished] = useState<string>("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Education",
    tags: "",
    author_name: "",
    read_time: "5 min read",
    published: false,
    featured_image_url: "",
    // SEO fields
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image_url: "",
    canonical_url: "",
    robots_meta: "index, follow",
  });

  const categories = [
    "Education",
    "Foreclosure Help",
    "Success Stories",
    "Market Insights",
    "Legal Tips",
    "Investment Strategies",
    "Property Analysis",
    "General",
  ];

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchBlogPosts();
  }, [user, navigate]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Education",
      tags: "",
      author_name: user?.name || "RepMotivatedSeller Team",
      read_time: "5 min read",
      published: false,
      featured_image_url: "",
      // SEO fields
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image_url: "",
      canonical_url: "",
      robots_meta: "index, follow",
    });
    setShowEditor(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(", "),
      author_name: post.author_name,
      read_time: post.read_time,
      published: post.published,
      featured_image_url: post.featured_image_url || "",
      // SEO fields
      meta_title: (post as any).meta_title || "",
      meta_description: (post as any).meta_description || "",
      meta_keywords: (post as any).meta_keywords || "",
      og_title: (post as any).og_title || "",
      og_description: (post as any).og_description || "",
      og_image_url: (post as any).og_image_url || "",
      canonical_url: (post as any).canonical_url || "",
      robots_meta: (post as any).robots_meta || "index, follow",
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;

      toast.success("Blog post deleted successfully");
      fetchBlogPosts();
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !post.published })
        .eq("id", post.id);

      if (error) throw error;

      toast.success(
        `Blog post ${!post.published ? "published" : "unpublished"} successfully`,
      );
      fetchBlogPosts();
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to update publish status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = generateSlug(formData.title);
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
        author_name: formData.author_name,
        author_id: user?.id,
        read_time: formData.read_time,
        published: formData.published,
        featured_image_url: formData.featured_image_url || null,
        // SEO fields
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        og_title: formData.og_title || null,
        og_description: formData.og_description || null,
        og_image_url:
          formData.og_image_url || formData.featured_image_url || null,
        canonical_url: formData.canonical_url || null,
        robots_meta: formData.robots_meta || "index, follow",
      };

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Blog post updated successfully");
      } else {
        // Create new post
        const { error } = await supabase.from("blog_posts").insert([postData]);

        if (error) throw error;
        toast.success("Blog post created successfully");
      }

      setShowEditor(false);
      fetchBlogPosts();
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || post.category === filterCategory;
    const matchesPublished =
      filterPublished === "all" ||
      (filterPublished === "published" && post.published) ||
      (filterPublished === "draft" && !post.published);

    return matchesSearch && matchesCategory && matchesPublished;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage blog posts</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {blogPosts.filter((p) => p.published).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {blogPosts.filter((p) => !p.published).length}
                </p>
              </div>
              <EyeOff className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">
                  {blogPosts.reduce((sum, post) => sum + post.views, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No blog posts found. Create your first post to get
                      started!
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {post.author_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.published ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title={post.published ? "Unpublish" : "Publish"}
                        >
                          {post.published ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editor Modal */}
        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditor(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                  </h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter blog post title"
                    />
                  </div>

                  {/* Category and Author */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            author_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief summary of the blog post"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) =>
                        setFormData({ ...formData, content: value })
                      }
                      placeholder="Write your blog post content here..."
                      className="min-h-[400px]"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use the toolbar above to format your content with
                      headings, lists, links, images, and more.
                    </p>
                  </div>

                  {/* Tags and Read Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="foreclosure, tips, legal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={formData.read_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            read_time: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5 min read"
                      />
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image
                    </label>
                    <ImageUploader
                      currentImage={formData.featured_image_url}
                      onImageUploaded={(url) =>
                        setFormData({ ...formData, featured_image_url: url })
                      }
                      onImageRemoved={() =>
                        setFormData({ ...formData, featured_image_url: "" })
                      }
                      bucket="blog-images"
                      folder="featured"
                      maxSizeMB={5}
                    />
                  </div>

                  {/* SEO Metadata Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🔍 SEO Metadata
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Optimize your blog post for search engines and social
                      media. Leave fields empty to auto-generate from title and
                      excerpt.
                    </p>

                    <div className="space-y-4">
                      {/* Meta Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Title
                          <span className="text-xs text-gray-500 ml-2">
                            (max 70 chars, leave empty to use post title)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.meta_title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meta_title: e.target.value,
                            })
                          }
                          placeholder="Custom SEO title for search engines"
                          maxLength={70}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.meta_title.length}/70 characters
                        </p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Description
                          <span className="text-xs text-gray-500 ml-2">
                            (max 160 chars, leave empty to use excerpt)
                          </span>
                        </label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meta_description: e.target.value,
                            })
                          }
                          placeholder="Brief description for search engine results"
                          maxLength={160}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.meta_description.length}/160 characters
                        </p>
                      </div>

                      {/* Meta Keywords */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Keywords
                          <span className="text-xs text-gray-500 ml-2">
                            (comma-separated)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.meta_keywords}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meta_keywords: e.target.value,
                            })
                          }
                          placeholder="foreclosure, real estate, homeowner assistance"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Open Graph Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Open Graph Title
                          <span className="text-xs text-gray-500 ml-2">
                            (for social media, max 100 chars)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.og_title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              og_title: e.target.value,
                            })
                          }
                          placeholder="Title when shared on Facebook, LinkedIn, etc."
                          maxLength={100}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Open Graph Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Open Graph Description
                          <span className="text-xs text-gray-500 ml-2">
                            (for social media, max 200 chars)
                          </span>
                        </label>
                        <textarea
                          value={formData.og_description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              og_description: e.target.value,
                            })
                          }
                          placeholder="Description when shared on social media"
                          maxLength={200}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Open Graph Image URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Open Graph Image URL
                          <span className="text-xs text-gray-500 ml-2">
                            (leave empty to use featured image)
                          </span>
                        </label>
                        <input
                          type="url"
                          value={formData.og_image_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              og_image_url: e.target.value,
                            })
                          }
                          placeholder="https://example.com/og-image.jpg (1200x630px recommended)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Canonical URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Canonical URL
                          <span className="text-xs text-gray-500 ml-2">
                            (auto-generated if empty)
                          </span>
                        </label>
                        <input
                          type="url"
                          value={formData.canonical_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              canonical_url: e.target.value,
                            })
                          }
                          placeholder="https://repmotivatedseller.com/blog/post-slug"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Robots Meta */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Robots Meta Tag
                        </label>
                        <select
                          value={formData.robots_meta}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              robots_meta: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="index, follow">
                            Index, Follow (Default - allow indexing)
                          </option>
                          <option value="noindex, follow">
                            No Index, Follow (don't show in search)
                          </option>
                          <option value="index, nofollow">
                            Index, No Follow (show but don't follow links)
                          </option>
                          <option value="noindex, nofollow">
                            No Index, No Follow (completely block)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Published Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="published"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Publish immediately
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEditor(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isSubmitting
                        ? "Saving..."
                        : editingPost
                          ? "Update Post"
                          : "Create Post"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminBlogManagement;
