"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react"; 
import type { Post } from "@/types/Post";
import api from "@/lib/api";
import Link from "next/link";

interface SavedPostProps {
  post: Post;
  onUnsave?: (postId: string) => void;
}

export default function SavedPost({ post, onUnsave }: SavedPostProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleUnsave = async () => {
    if (!onUnsave) return;
    setIsSaving(true);
    try {
      await api.post("/posts/unsave", { postId: post.id }, { withCredentials: true });
      onUnsave(post.id);
    } catch (error) {
      console.error("Failed to unsave post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg shadow-md bg-gray-900 dark:bg-gray-900 overflow-hidden">
      {post.coverImage && (
        <Link href={`/explore/post/${post.id}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}

      <div className="p-4 flex flex-col justify-between">
        <div>
          <Link href={`/explore/post/${post.id}`}>
            <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {post.description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {post.user?.avatar && (
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">{post.user?.username}</span>
          </div>

          <button
            onClick={handleUnsave}
            disabled={isSaving}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isSaving ? (
              <Bookmark className="h-5 w-5 text-gray-400 animate-pulse" />
            ) : (
              <BookmarkCheck className="h-5 w-5 text-blue-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
