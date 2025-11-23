// app/posts/[postId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Heart, Share2 } from "lucide-react";
import api from "@/lib/api";
import { Post } from "@/types/Post";
import { ImageGallery } from "@/app/components/ui/ImageGallery";

export default function PostPage() {
  const { postId } = useParams() as { postId: string };
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        const response = await api.get(`/posts/${postId}`);
        const data = response.data;
        if (data.success) setPost(data.data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      }
    }

    fetchPost();
  }, [postId]);

  if (!post) return <div className="p-4 text-center min-h-screen flex items-center justify-center">Loading...</div>;

  const isOwner = session?.user?.id === post.user?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-20 sm:pb-8 min-h-screen">
      {/* Header Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {post.title}
          </h1>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {isOwner && (
              <Link
                href={`/dashboard/my-posts/${post.id}`}
                className="px-3 sm:px-4 py-2 bg-[#5865F2] text-white hover:bg-[#4854e0] focus:ring-[#5865F2] rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                Edit
              </Link>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 break-words">
          {post.description}
        </p>
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="hidden sm:inline">•</span>
          <span>{post.images?.length || 0} images</span>
          <span className="hidden sm:inline">•</span>
          <span>{post._count?.likes || 0} likes</span>
          <span className="hidden sm:inline">•</span>
          <span>{post._count?.comments || 0} comments</span>
        </div>
      </section>

      {/* Image Gallery Section */}
      {post.images && post.images.length > 0 ? (
        <ImageGallery images={post.images} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No images available for this post.
        </div>
      )}

      {/* Action Buttons - Fixed at bottom for mobile, normal for desktop */}
      <div className="fixed bottom-16 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:static sm:bg-transparent sm:shadow-none sm:border-t sm:border-gray-200 sm:pt-6 sm:px-0 sm:mt-8 z-30">
        <div className="flex items-center justify-around sm:justify-start sm:gap-8 text-gray-600">
          <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:text-red-500 cursor-pointer transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-medium">{post._count?.likes || 0}</span>
          </button>
          
          <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:text-blue-600 cursor-pointer transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              {post.isSaved ? (
                <BookmarkCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium">Save</span>
          </button>

          <button className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 hover:text-green-600 cursor-pointer transition-colors group sm:ml-auto">
            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Extra bottom padding for mobile to account for fixed action bar and bottom navigation */}
      <div className="h-20 sm:h-0"></div>
    </div>
  );
}