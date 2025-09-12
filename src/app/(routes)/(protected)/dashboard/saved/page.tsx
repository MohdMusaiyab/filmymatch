"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SavedPost from "@/app/components/ui/SavedPost";

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      const response = await api.get("/posts/saved?page=1&limit=12", {
        withCredentials: true,
      });
      setSavedPosts(response.data.data.posts);
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleUnsave = (postId: string) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Saved Posts</h1>
      {savedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPosts.map((post) => (
            <SavedPost key={post.id} post={post} onUnsave={handleUnsave} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You haven’t saved any posts yet.</p>
      )}
    </div>
  );
}
