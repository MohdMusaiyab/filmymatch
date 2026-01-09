"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  createComment,
  getCommentsByPostId,
  deleteMyComment,
} from "@/actions/comment";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Trash2,
  Send,
  MessageCircle,
  User,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Button from "@/app/components/Button";

interface PostCommentProps {
  postId: string;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  post: {
    userId: string;
  };
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

const PostComment = ({
  postId,
  onCommentAdded,
  onCommentDeleted,
}: PostCommentProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await getCommentsByPostId(postId);
    if (res.success) {
      setComments(
        (res.data || []).map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt.toString(),
        }))
      );
    } else {
      setComments([]);
    }
    setLoading(false);
  }, [postId]);

  const handleCreateComment = async () => {
    if (!commentText.trim()) return toast.error("Write something first!");
    if (!userId) return toast.error("Please sign in to comment");

    setSubmitting(true);
    const res = await createComment(postId, commentText);

    if (res.success && res.data) {
      // 1. UPDATE UI IMMEDIATELY
      const newCommentData = res.data;
      const newComment: CommentType = {
        id: newCommentData.id,
        content: newCommentData.content,
        createdAt: newCommentData.createdAt.toString(),
        post: { userId: newCommentData.userId }, // Use userId from response
        user: {
          id: newCommentData.userId,
          username: getUsername() || "User",
          email: session?.user?.email || "",
          avatar: getUserAvatarUrl(),
        },
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      // 2. NOTIFY PARENT TO UPDATE COMMENT COUNT
      onCommentAdded?.();

      // 3. SHOW SUCCESS TOAST
      toast.success("Comment added!");

      // 4. REFETCH COMMENTS TO GET PROPER USER DATA
      // (Optional - can remove if you want pure optimistic update)
      setTimeout(() => {
        fetchComments();
      }, 300);
    } else {
      toast.error(res.error || "Failed to add comment");
    }
    setSubmitting(false);
  };

  const handleDelete = async (comment: CommentType) => {
    const isOwnComment = comment.user.id === userId;
    if (!isOwnComment) return;

    // 1. STORE PREVIOUS STATE FOR ROLLBACK
    const previousComments = [...comments];

    // 2. OPTIMISTIC UPDATE: Remove from UI immediately
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    setDeletingId(comment.id);
    setShowDeleteConfirm(null);

    // 3. NOTIFY PARENT TO UPDATE COMMENT COUNT
    onCommentDeleted?.();

    try {
      // 4. API CALL IN BACKGROUND (SILENT)
      const res = await deleteMyComment(comment.id);

      if (!res?.success) {
        // 5. ROLLBACK ON ERROR
        setComments(previousComments);
        onCommentAdded?.(); // Add back the count
        toast.error(res?.message || "Failed to delete comment");
      }
      // No success toast - silent deletion
    } catch (error) {
      // 6. ROLLBACK ON NETWORK ERROR
      setComments(previousComments);
      onCommentAdded?.(); // Add back the count
      toast.error("Network error. Please try again.");
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [fetchComments, postId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && commentText.trim() && !submitting) {
      e.preventDefault();
      handleCreateComment();
    }
  };

  // Helper functions
  const getUserAvatarUrl = () => {
    if (!session?.user) return null;
    const user = session.user as any;
    return user.image || user.avatar || null;
  };

  const getUsername = () => {
    if (!session?.user) return null;
    return session.user.username || session.user.email?.split("@")[0] || "User";
  };

  return (
    <div className="w-full">
      {/* Comment Input Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-full flex items-center justify-center overflow-hidden">
            {getUserAvatarUrl() ? (
              <Image
                src={getUserAvatarUrl()!}
                alt={getUsername() || "User"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add a Comment</h3>
            <p className="text-sm text-gray-500">Share your thoughts</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            maxLength={500}
            placeholder="Write your comment here..."
            className="w-full p-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30 focus:border-[#5865F2] transition-colors"
            disabled={!session || submitting}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {commentText.length}/500 characters
              {!session && (
                <p className="text-amber-600 mt-1">Please sign in to comment</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommentText("")}
                disabled={!commentText.trim() || submitting}
              >
                Clear
              </Button>
              <Button
                variant="theme-primary"
                size="sm"
                icon={
                  submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )
                }
                onClick={handleCreateComment}
                disabled={!commentText.trim() || submitting || !session}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5865F2]"></div>
            <p className="text-gray-600 mt-3">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No comments yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {comments.length} Comment{comments.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-gray-600 text-sm">Join the discussion</p>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => {
                const isOwnComment = comment.user.id === userId;
                const canDelete = isOwnComment && deletingId !== comment.id;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all ${
                      deletingId === comment.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5865F2]/20 to-[#94BBFF]/20 flex items-center justify-center overflow-hidden">
                          {comment.user.avatar ? (
                            <Image
                              src={comment.user.avatar}
                              alt={comment.user.username}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-[#5865F2]">
                              {comment.user.username?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {comment.user.username ||
                                comment.user.email.split("@")[0]}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          {canDelete && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm(
                                    showDeleteConfirm === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete your comment"
                                disabled={deletingId === comment.id}
                              >
                                <Trash2 size={16} />
                              </button>

                              {/* Delete Confirmation Modal */}
                              {showDeleteConfirm === comment.id && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900 mb-1">
                                        Delete comment?
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        This action cannot be undone.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setShowDeleteConfirm(null)}
                                      className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleDelete(comment)}
                                      className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {deletingId === comment.id && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Deleting...</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap mt-2">
                          {comment.content}
                        </p>

                        {/* Badges */}
                        <div className="flex gap-2 mt-3">
                          {isOwnComment && (
                            <span className="px-2 py-0.5 bg-[#5865F2]/10 text-[#5865F2] text-xs font-medium rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostComment;
