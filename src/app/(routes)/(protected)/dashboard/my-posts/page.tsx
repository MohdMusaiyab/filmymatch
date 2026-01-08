"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { Snippet } from "@/app/components/ui/Snippet";
import { Post } from "@/types/Post";
import {
  Plus, 
  Search,
  RefreshCw,
  FileText,
  Eye,
  BookOpen,
  AlertCircle,
  X,
  Lock,
  Globe,
} from "lucide-react";
import Button from "@/app/components/Button";

interface ApiResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const PostsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    public: 0,
    private: 0,
  });

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse>(
        "/posts/my-posts?page=1&limit=20"
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch posts");
      }

      const postsData = response.data.data.posts || [];
      setPosts(postsData);

      // Calculate stats
      setStats({
        total: postsData.length,
        published: postsData.filter((p) => !p.isDraft).length,
        drafts: postsData.filter((p) => p.isDraft).length,
        public: postsData.filter((p) => p.visibility === "PUBLIC").length,
        private: postsData.filter((p) => p.visibility === "PRIVATE").length,
      });

      toast.success(`Loaded ${postsData.length} posts`);
    } catch (err) {
      console.error("Failed to load posts:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts based on search
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your posts...
          </p>
          <p className="text-sm text-gray-500 mt-1">Fetching your content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Posts
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.reload()}
                variant="theme-primary"
                className="flex-1"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/dashboard/create-post")}
                variant="theme-primary"
                className="flex-1"
                icon={<Plus className="w-4 h-4" />}
              >
                Create First Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Snippets
              </h1>
              <p className="text-gray-600">
                Manage and organize all your code snippets in one place
              </p>
            </div>
            <Link href="/dashboard/create-post" className="sm:self-start">
              <Button
                variant="theme-primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Create New Snippet
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#5865F2]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#5865F2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.published}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.drafts}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Public</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.public}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Private</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.private}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search snippets by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30 focus:border-[#5865F2]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchPosts}
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-[#5865F2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-[#5865F2]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No snippets yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start sharing your code snippets, tutorials, or projects with
                the community.
              </p>
              <Link href="/dashboard/create-post">
                <Button
                  variant="theme-primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                >
                  Create Your First Snippet
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Need inspiration?{" "}
                <Link
                  href="/explore"
                  className="text-[#5865F2] hover:underline"
                >
                  Browse community snippets
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "snippet" : "snippets"}
                </span>
                {searchQuery && (
                  <span className="ml-2 text-sm text-gray-500">
                    matching {'"'}
                    <span className="font-medium">{searchQuery}</span>
                    {'"'}
                  </span>
                )}
              </div>
              {filteredPosts.length < posts.length && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-[#5865F2] hover:text-[#4854e0]"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="h-full">
                  <Snippet
                    post={{
                      ...post,
                      linkTo: `/dashboard/my-posts/${post.id}`,
                    }}
                    menuOpen={menuOpen}
                    toggleMenu={toggleMenu}
                    showActions={true}
                  />
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && posts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching snippets
                </h3>
                <p className="text-gray-600 mb-6">
                  No snippets found for &quot;
                  <span className="font-medium">{searchQuery}</span>&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#5865F2] hover:text-[#4854e0] font-medium"
                >
                  Clear search and show all snippets
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {posts.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {filteredPosts.length} of {stats.total} snippets
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.drafts} in draft • {stats.published} published
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredPosts.length < 20}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
