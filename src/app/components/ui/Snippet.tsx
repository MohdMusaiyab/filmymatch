"use client";

import { Edit, Trash, Share, MessageCircle, Ellipsis } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddCollectionButton from "../AddCollectionButton";
import { ToggleSaveButton } from "../ToggleSaveButton";
import LikeButton from "../LikeButton";
import { Post } from "@/types/Post";
import { Visibility } from "@/types";
import { VisibilityTag } from "../VisibilityTag";

const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1470&auto=format&fit=crop";

interface SnippetProps {
  post: Post;
  menuOpen: string | null;
  toggleMenu: (id: string) => void;
  userId?: string; // Optional: Pass current logged-in user ID from parent for Edit/Delete checks
}

export const Snippet = ({ post, menuOpen, toggleMenu, userId }: SnippetProps) => {
  
  // Clean time formatting (runs on client)
  function timeAgo(date: string | Date): string {
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) return "";
    const seconds = Math.floor((Date.now() - inputDate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Link href={post.linkTo ? post.linkTo : `/explore/post/${post.id}`}>
          <Image
            src={post.coverImage || DEFAULT_COVER_IMAGE}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </Link>

        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {/* 1. We pass the pre-calculated isSaved status from Step 1 */}
          <ToggleSaveButton 
            postId={post.id} 
            initialIsSaved={post.isSaved} 
          />

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleMenu(post.id);
              }}
              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition hover:bg-white"
            >
              <Ellipsis size={18} className="text-gray-600" />
            </button>

            {menuOpen === post.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 py-1">
                <AddCollectionButton postId={post.id} userId={post.user.id} />

                {/* Ownership check using passed-in userId instead of useSession hook */}
                {userId === post.user.id && (
                  <>
                    <Link
                      href={`/dashboard/my-posts/${post.id}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/10"
                    >
                      <Edit size={16} className="mr-2" /> Edit
                    </Link>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      <Trash size={16} className="mr-2" /> Delete
                    </button>
                  </>
                )}

                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10">
                  <Share size={16} className="mr-2" /> Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${post.user.id}`}>
            <div className="w-8 h-8 bg-primary/20 overflow-hidden rounded-full flex items-center justify-center">
              {post.user.avatar ? (
                <Image
                  src={post.user.avatar}
                  alt={post.user.username}
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div>
            <Link href={`/profile/${post.user.id}`}>
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {post.user.username}
              </h4>
            </Link>
            <p className="text-[10px] text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <Link href={post.linkTo ? post.linkTo : `/explore/post/${post.id}`} className="group">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {post.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <VisibilityTag visibility={post.visibility as Visibility} />
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {/* 2. LikeButton now gets all data via props */}
            <LikeButton 
              postId={post.id} 
              initialLiked={post.isLiked} 
              initialCount={post._count.likes} 
            />
            
            <div className="flex items-center gap-1.5">
              <MessageCircle size={18} />
              <span>{post._count?.comments ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};