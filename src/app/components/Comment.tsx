"use client";

import React, { useEffect, useState } from "react";
import {
  createComment,
  getCommentsByPostId,
  deleteMyComment,
  deleteCommentByPostOwner,
} from "@/actions/comment";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface PostCommentProps {
  postId: string;
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
  };
}

const PostComment = ({ postId }: PostCommentProps) => {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
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
  };

  const handleCreateComment = async () => {
    if (!commentText.trim()) return toast.error("Write something first!");
    setSubmitting(true);
    const res = await createComment(postId, commentText);
    if (res.success) {
      toast.success("Comment added!");
      setCommentText("");
      fetchComments();
    } else {
      toast.error(res.error || "Failed to add comment");
    }
    setSubmitting(false);
  };

  const handleDelete = async (comment: CommentType) => {
    const isPostOwner = comment.post.userId === session?.user?.id;
    const isOwnComment = comment.user.id === session?.user?.id;

    let res;
    if (isOwnComment) {
      res = await deleteMyComment(comment.id);
    } else if (isPostOwner) {
      res = await deleteCommentByPostOwner(comment.id, postId);
    }

    if (res?.success) {
      toast.success("Comment deleted");
      fetchComments();
    } else {
      toast.error(res?.message || "Could not delete comment");
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-zinc-950/60 backdrop-blur-lg rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4 text-white">Comments</h2>

      {/* Input */}
      <div className="flex flex-col gap-2 mb-6">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Write a comment..."
          className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">{commentText.length}/500</span>
          <button
            onClick={handleCreateComment}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-zinc-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-zinc-500 italic">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => {
            const isPostOwner = comment.post.userId === session?.user?.id;
            const isOwnComment = comment.user.id === session?.user?.id;
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-white relative"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-medium text-indigo-400">
                      {comment.user.username || comment.user.email}
                    </h4>
                    <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>
                    <span className="text-xs text-zinc-500 mt-2 inline-block">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {(isOwnComment || isPostOwner) && (
                    <button
                      onClick={() => handleDelete(comment)}
                      className="text-zinc-400 hover:text-red-500 transition"
                      title="Delete Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostComment;
