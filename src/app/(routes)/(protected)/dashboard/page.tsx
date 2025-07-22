"use client";

import { useState, useEffect } from "react";
import { Collections } from "@/app/components/ui/Collections";
import { Drafts } from "@/app/components/ui/Drafts";
import { Collection, Draft } from "@/types";
import { Snippet } from "@/app/components/ui/Snippet";
import api from "@/lib/api";
import Link from "next/link";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleMenu = (postId: string) => {
    setMenuOpen(menuOpen === postId ? null : postId);
  };

  useEffect(() => {
    // Fetch recent posts
    const fetchRecentPosts = async () => {
      try {
        const response = await api.get("/posts/my-posts/recent");
        setRecentPosts(response.data.posts);
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const collections: Collection[] = [
    { id: 1, tag: "Films", count: 24, icon: "🎬" },
    { id: 2, tag: "Podcasts", count: 16, icon: "🎙️" },
    { id: 3, tag: "Books", count: 32, icon: "📚" },
    { id: 4, tag: "Articles", count: 18, icon: "📄" },
  ];

  const drafts: Draft[] = [
    {
      id: 1,
      title: "YouTube: The Future of AI in Design",
      type: "YouTube",
      status: "Draft",
      timeAgo: "Started yesterday",
      icon: "📺",
    },
    {
      id: 2,
      title: "The Matrix: Resurrections",
      type: "Film",
      status: "Draft",
      timeAgo: "Started 3 days ago",
      icon: "🎬",
    },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Collections</h2>
            <Collections collections={collections} />
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Posts</h2>
              <Link
                href="/dashboard/my-posts"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Snippet
                    key={post.id}
                    post={post}
                    menuOpen={menuOpen}
                    toggleMenu={toggleMenu}
                    showActions={false}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    You haven't created any posts yet
                  </p>
                  <Link
                    href="/dashboard/create-post"
                    className="mt-2 inline-block text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Create your first post
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Drafts</h2>
            <Drafts drafts={drafts} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
