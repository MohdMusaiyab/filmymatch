"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Heart,
  Share2,
  Calendar,
  Images,
  MessageCircle,
  Edit2,
  User,
  ArrowLeft,
  Tag,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import api from "@/lib/api";
import { Post } from "@/types/Post";
import { ImageGallery } from "@/app/components/ui/ImageGallery";
import { ToggleSaveButton } from "@/app/components/ToggleSaveButton";
import Button from "@/app/components/Button";
import { VisibilityTag } from "@/app/components/VisibilityTag";
import PostComment from "@/app/components/Comment";

export default function PostPage() {
  const { postId } = useParams() as { postId: string };
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${postId}`);
        const data = response.data;
        if (data.success) {
          setPost(data.data);
          setCommentCount(data.data._count?.comments || 0);
        }
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  const PostSkeleton = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Main card skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-3 mt-6">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Media section skeleton */}
      <div className="mb-8">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded-xl border border-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <PostSkeleton />;
  if (!post) return null;

  const isOwner = session?.user?.id === post.user?.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Handler for comment count changes
  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
            className="mb-4"
          >
            Back
          </Button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left Content */}
            <div className="flex-1">
              {/* Author & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.user.id}`}>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#5865F2] to-[#94BBFF] p-0.5">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {post.user.avatar ? (
                          <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </Link>

                  <div>
                    <Link href={`/profile/${post.user.id}`}>
                      <p className="font-semibold text-gray-900 hover:text-[#5865F2] transition-colors">
                        {post.user.username}
                      </p>
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <VisibilityTag visibility={post.visibility} />
                  {post.linkTo && (
                    <a
                      href={post.linkTo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      External Link
                    </a>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {post.description}
                </p>
              </div>

              {/* Stats Bar - Updated with commentCount state */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Likes</p>
                    <p className="font-semibold text-gray-900">
                      {post._count?.likes || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Comments</p>
                    <p className="font-semibold text-gray-900">
                      {commentCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#5865F2]/10 to-[#94BBFF]/10 text-[#5865F2] rounded-full text-sm font-medium border border-[#5865F2]/20"
                      >
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex sm:flex-col gap-3 self-start">
              <ToggleSaveButton
                postId={post.id}
                initialIsSaved={post.isSaved}
              />

              {isOwner && (
                <Link href={`/dashboard/my-posts/${post.id}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<Edit2 className="w-5 h-5" />}
                    className="w-full justify-center"
                  >
                    Edit
                  </Button>
                </Link>
              )}

              <Button
                variant="theme-primary"
                size="lg"
                icon={<Share2 className="w-5 h-5" />}
                onClick={handleShare}
                className="w-full justify-center"
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Media Section */}
        {post.images && post.images.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-xl flex items-center justify-center">
                  <Images className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Media Gallery
                  </h2>
                  <p className="text-gray-600">
                    {post.images.length} image
                    {post.images.length !== 1 ? "s" : ""} attached
                  </p>
                </div>
              </div>
            </div>

            <ImageGallery images={post.images} />
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Comments</h2>
              <p className="text-gray-600">
                {commentCount} comment{commentCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Pass callbacks to update comment count */}
          <PostComment
            postId={postId}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>
    </div>
  );
}
