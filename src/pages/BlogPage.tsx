import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  category: string;
  read_time: string;
  tags: string[];
  slug: string;
}

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      // Fallback to empty array if there's an error
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Use database posts if available, otherwise show message
  const displayPosts = blogPosts.length > 0 ? blogPosts : [];

  const categories = [
    { value: "all", label: "All Posts", icon: "📚" },
    { value: "Education", label: "Education", icon: "🎓" },
    { value: "Financial Tips", label: "Financial Tips", icon: "💰" },
    { value: "Legal", label: "Legal", icon: "⚖️" },
    { value: "Success Stories", label: "Success Stories", icon: "🏆" },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? displayPosts
      : displayPosts.filter((post) => post.category === selectedCategory);

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
    <>
      <Helmet>
        <title>Blog - Foreclosure Prevention Tips | RepMotivatedSeller</title>
        <meta
          name="description"
          content="Expert advice on foreclosure prevention, financial planning, and success stories from families who saved their homes."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">📝 Our Blog</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Expert guidance and actionable advice to help you save your home
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.value
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Blog Posts Yet
                </h3>
                <p className="text-gray-600">
                  Check back soon for expert articles and insights on
                  foreclosure prevention and real estate investing.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="block"
                  >
                    <motion.article
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all h-full"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <div className="text-6xl">📄</div>
                      </div>
                      <div className="p-6">
                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {post.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2 hover:text-indigo-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{post.author_name}</span>
                          <span>{post.read_time}</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
