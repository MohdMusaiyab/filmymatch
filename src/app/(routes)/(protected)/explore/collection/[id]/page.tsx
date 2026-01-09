"use client";
import React from "react";
import { Snippet } from "@/app/components/ui/Snippet";
import { getCollectionById } from "@/actions/collection";
import { toast } from "sonner";
import { notFound, redirect } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Post } from "@/types/Post";
import {
  FolderOpen,
  Calendar,
  Eye,
  Lock,
  Users,
  Grid,
  List,
  ArrowLeft,
  Settings,
  Plus,
  BookOpen,
  Hash,
} from "lucide-react";
import Button from "@/app/components/Button";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  posts: Post[];
  isOwner?: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: Collection;
  error?: {
    message: string;
    code: string;
  };
}

const CollectionPage = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [collection, setCollection] = React.useState<Collection | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    const fetchCollection = async () => {
      try {
        const result = (await getCollectionById(id)) as ApiResponse;

        if (!result.success) {
          if (result.error?.code === "NOT_FOUND") {
            notFound();
          }

          if (result.error?.code === "UNAUTHORIZED") {
            redirect("/login");
          }

          toast.error(result.error?.message || "An error occurred");
          redirect("/collections");
          return;
        }

        if (result.data) {
          setCollection(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch collection:", error);
        toast.error("Failed to load collection");
        redirect("/collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Eye className="w-4 h-4" />;
      case "PRIVATE":
        return <Lock className="w-4 h-4" />;
      case "FOLLOWERS":
        return <Users className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return "text-green-600 bg-green-50 border-green-200";
      case "PRIVATE":
        return "text-red-600 bg-red-50 border-red-200";
      case "FOLLOWERS":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Header skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-3">
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/dashboard/my-collection">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="mb-4"
            >
              Back to Collections
            </Button>
          </Link>
        </div>

        {/* Collection Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
              {collection.coverImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={collection.coverImage}
                    alt={collection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Collection Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {collection.name}
                  </h1>
                  <p className="text-gray-600 max-w-2xl">
                    {collection.description || "No description provided"}
                  </p>
                </div>

                {collection.isOwner && (
                  <Link href={`/dashboard/my-collection/${collection.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Settings className="w-4 h-4" />}
                    >
                      Edit Collection
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats and Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#5865F2]/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#5865F2]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Posts</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {collection.posts.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(collection.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium ${getVisibilityColor(
                      collection.visibility
                    )}`}
                  >
                    {getVisibilityIcon(collection.visibility)}
                    {collection.visibility.charAt(0) +
                      collection.visibility.slice(1).toLowerCase()}
                  </span>
                </div>

                {collection.isOwner && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-200">
                      <Hash className="w-4 h-4" />
                      Owner
                    </span>
                  </div>
                )}
              </div>

              {/* Last Updated */}
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {new Date(collection.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-8">
          {/* Header and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-lg flex items-center justify-center">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Collection Posts
                </h2>
                <p className="text-gray-600 text-sm">
                  {collection.posts.length} snippet
                  {collection.posts.length !== 1 ? "s" : ""} in this collection
                </p>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#5865F2] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-[#5865F2] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {collection.isOwner && (
                <Link href="/dashboard/create-post">
                  <Button
                    variant="theme-primary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Post
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Posts Grid/List */}
          {collection.posts.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {collection.posts.map((post) => (
                <div
                  key={post.id}
                  className={
                    viewMode === "list"
                      ? "bg-white rounded-xl border border-gray-200 p-4"
                      : ""
                  }
                >
                  <Snippet
                    post={{
                      id: post.id,
                      title: post.title,
                      description: post.description || post.title,
                      category: post.category,
                      visibility: post.visibility,
                      coverImage: post.coverImage || undefined,
                      user: {
                        id: post.user.id,
                        username: post.user.username,
                        avatar: post.user.avatar || undefined,
                      },
                      images: [],
                      _count: {
                        likes: post._count?.likes || 0,
                        comments: post._count?.comments || 0,
                      },
                      createdAt: post.createdAt,
                      linkTo: `/explore/post/${post.id}`,
                      isSaved: post.isSaved || false,
                    }}
                    menuOpen={null}
                    toggleMenu={() => {}}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-[#5865F2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-[#5865F2]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Empty Collection
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This collection doesn&apos;t have any posts yet. Start adding
                snippets to organize your content!
              </p>
              {collection.isOwner ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard/create-post">
                    <Button
                      variant="theme-primary"
                      size="lg"
                      icon={<Plus className="w-5 h-5" />}
                    >
                      Create New Post
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      size="lg"
                      icon={<Eye className="w-5 h-5" />}
                    >
                      Browse Posts
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">
                  Only the owner can add posts to this collection.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
