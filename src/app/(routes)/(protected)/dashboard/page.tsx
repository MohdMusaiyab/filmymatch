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

  const [postsLoading, setPostsLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [draftsLoading, setDraftsLoading] = useState(true);

  const toggleMenu = (postId: string) => {
    setMenuOpen(menuOpen === postId ? null : postId);
  };

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await api.get("/posts/my-posts/recent", {
          withCredentials: true,
        });
        setRecentPosts(response.data.posts);
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      } finally {
        setPostsLoading(false);
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
      } finally {
        setCollectionsLoading(false);
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
      } finally {
        setDraftsLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const CollectionsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-[140px] rounded-xl bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );

  const SnippetSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );

  const DraftSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
    </div>
  );

  return (
    <div className="overflow-x-hidden">
      <div className="p-2">
        <section className="mb-12">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Collections</h3>
            <Link href="/dashboard/my-collection" className="text-primary">
              View All
            </Link>
          </div>

          {collectionsLoading ? (
            <CollectionsSkeleton />
          ) : (
            <Collections collections={recentCollections} />
          )}
        </section>

        <section className="mb-12">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Posts</h3>
            <Link href="/dashboard/my-posts" className="text-primary">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {postsLoading ? (
              [...Array(3)].map((_, i) => <SnippetSkeleton key={i} />)
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Snippet
                  key={post.id}
                  post={post}
                  menuOpen={menuOpen}
                  toggleMenu={toggleMenu}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400">
                You haven’t created any posts yet.
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Drafts</h3>
              <Link href="/dashboard/drafts" className="text-primary">
              View All
            </Link>
          </div>

          {draftsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <DraftSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Drafts drafts={drafts} />
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
