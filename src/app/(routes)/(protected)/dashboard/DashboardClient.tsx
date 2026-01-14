"use client";

import { useState } from "react";
import { Collections } from "@/app/components/ui/Collections";
import { Drafts } from "@/app/components/ui/Drafts";
import { Snippet } from "@/app/components/ui/Snippet";
import { Post as PostType } from "@/types/Post";
import { Collection, Draft } from "@/types";
import Link from "next/link";

interface DashboardClientProps {
  initialPosts: PostType[];
  initialCollections: Collection[];
  initialDrafts: Draft[];
  userId: string;
}

const DashboardClient = ({ 
  initialPosts, 
  initialCollections, 
  initialDrafts, 
  userId 
}: DashboardClientProps) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleMenu = (postId: string) => {
    setMenuOpen(menuOpen === postId ? null : postId);
  };

  return (
    <div className="overflow-x-hidden p-4 max-w-7xl mx-auto">
      {/* 1. Recent Collections */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Recent Collections</h3>
            <p className="text-gray-500 text-sm">Your organized snippets</p>
          </div>
          <Link href="/dashboard/my-collection" className="text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        {initialCollections.length > 0 ? (
          <Collections collections={initialCollections} />
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No collections found.</p>
          </div>
        )}
      </section>

      {/* 2. Recent Posts */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Recent Posts</h3>
            <p className="text-gray-500 text-sm">Your latest public contributions</p>
          </div>
          <Link href="/dashboard/my-posts" className="text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialPosts.length > 0 ? (
            initialPosts.map((post) => (
              <Snippet
                key={post.id}
                post={post}
                userId={userId} // Passing userId enables Edit/Delete buttons
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
              <p className="text-gray-400">You haven’t created any posts yet.</p>
              <Link href="/create" className="text-primary font-bold mt-2 inline-block">
                Create your first snippet
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Your Drafts */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Drafts</h3>
            <p className="text-gray-500 text-sm">Finish where you left off</p>
          </div>
          <Link href="/dashboard/drafts" className="text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        {initialDrafts.length > 0 ? (
          <Drafts drafts={initialDrafts} />
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No active drafts.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardClient;