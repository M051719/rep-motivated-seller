import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Clock,
  User,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  blog_post_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  blog_posts?: {
    title: string;
    slug: string;
  };
}

const AdminCommentModeration: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "spam"
  >("pending");
  const [expandedComment, setExpandedComment] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("blog_comments")
        .select(
          `
          *,
          blog_posts (
            title,
            slug
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const updateCommentStatus = async (
    commentId: string,
    newStatus: "approved" | "rejected" | "spam",
  ) => {
    try {
      const { error } = await supabase
        .from("blog_comments")
        .update({
          status: newStatus,
          moderated_at: new Date().toISOString(),
          moderated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", commentId);

      if (error) throw error;

      toast.success(`Comment ${newStatus}!`);
      await fetchComments();
    } catch (error: any) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment permanently?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast.success("Comment deleted");
      await fetchComments();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "spam":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "spam":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Comment Moderation
        </h1>
        <p className="text-gray-600">Review and manage blog post comments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div
          onClick={() => setFilter("all")}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
            filter === "all" ? "ring-2 ring-indigo-500" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter("pending")}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
            filter === "pending" ? "ring-2 ring-yellow-500" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter("approved")}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
            filter === "approved" ? "ring-2 ring-green-500" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter("rejected")}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
            filter === "rejected" ? "ring-2 ring-red-500" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div
          onClick={() => setFilter("spam")}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
            filter === "spam" ? "ring-2 ring-gray-500" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Spam</p>
              <p className="text-2xl font-bold text-gray-600">{stats.spam}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No comments found
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No comments have been submitted yet."
              : `No ${filter} comments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {comment.author_name}
                          </span>
                        </div>
                        {comment.author_email && (
                          <span className="text-sm text-gray-500">
                            ({comment.author_email})
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(comment.status)}`}
                        >
                          {getStatusIcon(comment.status)}
                          <span className="capitalize">{comment.status}</span>
                        </span>
                      </div>
                      {comment.blog_posts && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>On: {comment.blog_posts.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t">
                    {comment.status !== "approved" && (
                      <button
                        onClick={() =>
                          updateCommentStatus(comment.id, "approved")
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    )}
                    {comment.status !== "rejected" && (
                      <button
                        onClick={() =>
                          updateCommentStatus(comment.id, "rejected")
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}
                    {comment.status !== "spam" && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, "spam")}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Mark as Spam</span>
                      </button>
                    )}
                    {comment.blog_posts && (
                      <a
                        href={`/blog/${comment.blog_posts.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Post</span>
                      </a>
                    )}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="ml-auto px-4 py-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
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

export default AdminCommentModeration;
