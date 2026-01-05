// app/posts/[postId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Heart,
  Share2,
  Calendar,
  Images,
  MessageCircle,
  Edit2,
} from "lucide-react";
import api from "@/lib/api";
import { Post } from "@/types/Post";
import { ImageGallery } from "@/app/components/ui/ImageGallery";
import { ToggleSaveButton } from "@/app/components/ToggleSaveButton";

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

  const PostSkeleton = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="flex gap-4 mt-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="max-w-6xl px-4 sm:px-6 py-4 h-8 w-1/4 bg-gray-200 rounded"></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 rounded-xl border border-gray-200"
          />
        ))}
      </div>
    </div>
  );

  if (!post) return <PostSkeleton />;

  const isOwner = session?.user?.id === post.user?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-20 sm:pb-8 min-h-screen">
      {/* Header Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}
          <div className="flex-1">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/profile/${post.user.id}`}>
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden ring-1 ring-gray-200">
                  {post.user.avatar ? (
                    <img
                      src={post.user.avatar}
                      alt={post.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center h-full font-semibold text-gray-700">
                      {post.user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              <div className="leading-tight">
                <Link href={`/profile/${post.user.id}`}>
                  <p className="font-semibold text-gray-900 hover:underline">
                    {post.user.username}
                  </p>
                </Link>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed max-w-3xl mb-5">
              {post.description}
            </p>

            {/* Meta Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                <Images size={13} /> {post.images?.length || 0} media
              </span>
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                <Heart size={13} /> {post._count?.likes || 0} likes
              </span>
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                <MessageCircle size={13} /> {post._count?.comments || 0}{" "}
                comments
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 self-start">
            <ToggleSaveButton postId={post.id} initialIsSaved={post.isSaved} />

            {isOwner && (
              <Link
                href={`/dashboard/my-posts/${post.id}`}
                className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition"
              >
                <Edit2 size={18} />
              </Link>
            )}

            <button className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>

        <div>
          {post.images?.length ? (
            <ImageGallery images={post.images} />
          ) : (
            <div className="text-center text-gray-400 py-12">
              No media available for this post.
            </div>
          )}
        </div>
      </section>

      {/* Extra bottom padding for mobile to account for fixed action bar and bottom navigation */}
      <div className="h-20 sm:h-0"></div>
    </div>
  );
}
