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
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleMenu = (postId: string) => {
    setMenuOpen(menuOpen === postId ? null : postId);
  };

  useEffect(() => {
    // Fetch recent posts
    const fetchRecentPosts = async () => {
      try {
        const response = await api.get("/posts/my-posts/recent", {
          withCredentials: true,
        });
        setRecentPosts(response.data.posts);
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get("/collections/my-collections/recent", {
          withCredentials: true,
        });
        setRecentCollections(response.data.data.collections);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await api.get("/posts/my-posts/drafts", {
          withCredentials: true,
        });
        setDrafts(response.data.data.drafts);
      } catch (error) {
        console.error("Failed to fetch drafts:", error);
      }
    };

    fetchDrafts();
  }, []);

  // const drafts: Draft[] = [
  //   {
  //     id: 1,
  //     title: "YouTube: The Future of AI in Design",
  //     type: "YouTube",
  //     status: "Draft",
  //     timeAgo: "Started yesterday",
  //     icon: "📺",
  //   },
  //   {
  //     id: 2,
  //     title: "The Matrix: Resurrections",
  //     type: "Film",
  //     status: "Draft",
  //     timeAgo: "Started 3 days ago",
  //     icon: "🎬",
  //   },
  // ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <div className="p-2">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Recent Collections
            </h3>
            <button className="text-primary font-medium hover:text-primary/80 transition-colors">View All</button>
          </div>
          <Collections collections={recentCollections} showCoverImage={false} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <Link
              href="/dashboard/my-posts"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="text-center py-8 col-span-full">
                <p className="text-gray-500">
                  You haven&#39;t created any posts yet
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
          <h2 className="text-xl font-semibold mb-4">Your Drafts</h2>
          <Drafts drafts={drafts} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
