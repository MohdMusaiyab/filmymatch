"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { Snippet } from '@/app/components/ui/Snippet';
import Button from '@/app/components/Button';

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  images: {
    id: string;
    url: string;
    description: string | null;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  tags?: string[];
  isDraft?: boolean;
  isSaved: boolean; // ✅ ADD THIS LINE
}


interface ApiResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<ApiResponse>("/posts/my-posts?page=1&limit=10");

        if (!response.data.posts) {
          throw new Error("No posts data received");
        }

        setPosts(response.data.posts);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        toast.error("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading your posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white dark:text-white">My Posts</h1>    
      </div>

      {posts.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You haven't created any posts yet.{" "}
                <Link
                  href="/dashboard/create-post"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create your first post
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="h-full">
              <Snippet
                post={{ ...post, linkTo: `/dashboard/my-posts/${post.id}` }} // ✅ inject linkTo
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
                showActions={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;