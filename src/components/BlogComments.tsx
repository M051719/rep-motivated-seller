import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import {
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  blog_post_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  parent_comment_id: string | null;
  created_at: string;
  reply_count?: number;
}

interface BlogCommentsProps {
  blogPostId: string;
  initialCommentCount?: number;
}

const BlogComments: React.FC<BlogCommentsProps> = ({
  blogPostId,
  initialCommentCount = 0,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  useEffect(() => {
    fetchComments();
  }, [blogPostId]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("blog_post_id", blogPostId)
        .eq("status", "approved")
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComments(data || []);
      setCommentCount(data?.length || 0);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setSubmitting(true);

      const commentData = {
        blog_post_id: blogPostId,
        user_id: user?.id,
        author_name: user?.name || user?.email?.split("@")[0] || "Anonymous",
        author_email: user?.email,
        content: newComment.trim(),
        status: "pending", // Comments need admin approval
        parent_comment_id: replyToId,
      };

      const { data, error } = await supabase
        .from("blog_comments")
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Comment submitted! It will appear after admin approval.");
      setNewComment("");
      setReplyToId(null);

      // Optionally refresh comments after a delay
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" />
          Comments ({commentCount})
        </h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {replyToId ? "Write a reply" : "Leave a comment"}
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Comments are moderated and will appear after approval</span>
            </div>
            <div className="flex items-center space-x-2">
              {replyToId && (
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-600 mb-4">Sign in to leave a comment</p>
          <a
            href="/auth"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="border-l-4 border-indigo-200 pl-4 py-2"
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {comment.author_name}
                        </span>
                        {comment.status === "approved" && (
                          <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Reply button (if authenticated) */}
                    {isAuthenticated && !replyToId && (
                      <button
                        onClick={() => setReplyToId(comment.id)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BlogComments;
