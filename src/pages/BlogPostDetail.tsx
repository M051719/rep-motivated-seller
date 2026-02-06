import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabase";
import BlogComments from "../components/BlogComments";
import { BackButton } from "../components/ui/BackButton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  category: string;
  read_time: string;
  tags: string[];
  slug: string;
  featured_image_url?: string;
  comment_count?: number;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  robots_meta?: string;
}

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const fetchBlogPost = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch the blog post by slug
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (postError) throw postError;

      setPost(postData);

      // Fetch related posts from the same category
      if (postData) {
        const { data: relatedData, error: relatedError } = await supabase
          .from("blog_posts")
          .select(
            "id, title, excerpt, author_name, published_at, category, read_time, tags, slug, featured_image_url",
          )
          .eq("published", true)
          .eq("category", postData.category)
          .neq("id", postData.id)
          .order("published_at", { ascending: false })
          .limit(3);

        if (!relatedError && relatedData) {
          setRelatedPosts(relatedData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to load blog post");
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug, fetchBlogPost]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.title || "";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        setShowShareMenu(false);
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        {/* Page Title */}
        <title>{post.meta_title || post.title} | RepMotivatedSeller Blog</title>

        {/* Meta Description */}
        <meta
          name="description"
          content={post.meta_description || post.excerpt}
        />

        {/* Meta Keywords */}
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords} />
        )}

        {/* Canonical URL */}
        {post.canonical_url && (
          <link rel="canonical" href={post.canonical_url} />
        )}

        {/* Robots Meta */}
        {post.robots_meta && <meta name="robots" content={post.robots_meta} />}

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={post.og_title || post.title} />
        <meta
          property="og:description"
          content={post.og_description || post.excerpt}
        />
        <meta
          property="og:image"
          content={post.og_image_url || post.featured_image_url || ""}
        />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author_name} />
        {post.tags && post.tags.length > 0 && (
          <meta property="article:tag" content={post.tags.join(", ")} />
        )}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.og_title || post.title} />
        <meta
          name="twitter:description"
          content={post.og_description || post.excerpt}
        />
        <meta
          name="twitter:image"
          content={post.og_image_url || post.featured_image_url || ""}
        />

        {/* Schema.org Article Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.featured_image_url || post.og_image_url,
            datePublished: post.published_at,
            author: {
              "@type": "Person",
              name: post.author_name,
            },
            publisher: {
              "@type": "Organization",
              name: "RepMotivatedSeller",
              logo: {
                "@type": "ImageObject",
                url: "https://repmotivatedseller.com/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": shareUrl,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <BackButton fallbackPath="/blog" />
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-semibold">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{post.read_time}</span>
              </div>
            </div>

            {/* Share Button */}
            <div className="mb-8 relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </button>

              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                >
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700"
                  >
                    <Facebook className="w-4 h-4 mr-3 text-blue-600" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700"
                  >
                    <Twitter className="w-4 h-4 mr-3 text-sky-500" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700"
                  >
                    <Linkedin className="w-4 h-4 mr-3 text-blue-700" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700"
                  >
                    <Link2 className="w-4 h-4 mr-3 text-gray-600" />
                    Copy Link
                  </button>
                </motion.div>
              )}
            </div>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                lineHeight: "1.8",
                fontSize: "1.125rem",
                color: "#374151",
              }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 pt-8 border-t">
                <Tag className="w-4 h-4 text-gray-500" />
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Comments Section */}
          <BlogComments
            blogPostId={post.id}
            initialCommentCount={post.comment_count || 0}
          />
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-white py-12 border-t">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <motion.div
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      whileHover={{ y: -5 }}
                    >
                      {relatedPost.featured_image_url ? (
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                          <div className="text-6xl">📄</div>
                        </div>
                      )}
                      <div className="p-6">
                        <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs font-semibold">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 group-hover:text-indigo-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                          <span>{relatedPost.author_name}</span>
                          <span>{relatedPost.read_time}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help with Foreclosure?
            </h2>
            <p className="text-lg text-indigo-100 mb-8">
              Get expert guidance and support to save your home. Schedule a free
              consultation today.
            </p>
            <Link
              to="/consultation"
              className="inline-block bg-white text-indigo-900 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Book Free Consultation
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPostDetail;
