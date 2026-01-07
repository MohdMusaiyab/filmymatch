"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Snippet } from "@/app/components/ui/Snippet";
import Button from "@/app/components/Button";
import { Bookmark, BookmarkCheck, RefreshCw, Search, Filter, X, FolderOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SavedPost {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  images: Array<{
    id: string;
    url: string;
    description?: string;
  }>;
  _count: {
    likes: number;
    comments: number;
  };
  visibility: string;
  category: string;
  tags: string[];
  createdAt: string;
  isSaved: boolean;
  linkTo?: string;
}

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
  });

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const fetchSavedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/saved?page=1&limit=20", {
        withCredentials: true,
      });
      
      const postsData = response.data.data.posts || [];
      setSavedPosts(postsData);

      // Calculate stats
      const totalImages = postsData.reduce((acc: number, post: SavedPost) => 
        acc + (post.images?.length || 0), 0
      );
      
      setStats({
        total: postsData.length,
        images: totalImages,
        videos: postsData.filter((p: SavedPost) => 
          p.images?.some(img => img.url.includes('.mp4') || img.url.includes('.webm'))
        ).length,
      });

      toast.success(`Loaded ${postsData.length} saved snippets`);
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
      toast.error("Failed to load saved posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const handleUnsave = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}/save`, {
        withCredentials: true,
      });
      
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Removed from saved");
    } catch (error) {
      console.error("Failed to unsave post:", error);
      toast.error("Failed to remove from saved");
    }
  };

  const handleUnsaveAll = async () => {
    if (!confirm("Are you sure you want to remove all saved posts?")) return;
    
    try {
      for (const post of savedPosts) {
        await api.delete(`/posts/${post.id}/save`, {
          withCredentials: true,
        });
      }
      
      setSavedPosts([]);
      toast.success("All saved posts removed");
    } catch (error) {
      console.error("Failed to unsave all posts:", error);
      toast.error("Failed to remove all saved posts");
    }
  };

  const filteredPosts = savedPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading saved snippets...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching your collection</p>
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-xl flex items-center justify-center">
                  <BookmarkCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Saved Snippets</h1>
                  <p className="text-gray-600">Your personal collection of useful code snippets</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {savedPosts.length > 0 && (
                <Button
                  onClick={handleUnsaveAll}
                  variant="outline"
                  size="sm"
                  icon={<Bookmark className="w-4 h-4" />}
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={fetchSavedPosts}
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-[#5865F2]/10 rounded-lg flex items-center justify-center">
                  <BookmarkCheck className="w-5 h-5 text-[#5865F2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Images</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.videos}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
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
                    placeholder="Search saved snippets by title, description, or tags..."
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

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Filter className="w-4 h-4" />}
                >
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {savedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-[#5865F2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-[#5865F2]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved snippets yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start building your collection by saving useful code snippets from the community.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/explore'}
                  variant="theme-primary"
                  size="lg"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  Explore Snippets
                </Button>
                <p className="text-sm text-gray-500">
                  Browse the community to find snippets worth saving
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'snippet' : 'snippets'}
                </span>
                {searchQuery && (
                  <span className="ml-2 text-sm text-gray-500">
                    matching &quot;<span className="font-medium">{searchQuery}</span>&quot;
                  </span>
                )}
              </div>
              {filteredPosts.length < savedPosts.length && (
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
                      linkTo: `/explore/post/${post.id}`,
                      isSaved: true,
                    }}
                    menuOpen={menuOpen}
                    toggleMenu={toggleMenu}
                    showActions={true}
                  />
                  <div className="mt-3">
                    <Button
                      onClick={() => handleUnsave(post.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      icon={<BookmarkCheck className="w-4 h-4" />}
                    >
                      Remove from Saved
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && savedPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching saved snippets
                </h3>
                <p className="text-gray-600 mb-6">
                  No saved snippets found for &quot;
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
        {savedPosts.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {filteredPosts.length} of {stats.total} saved snippets
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Your personal collection • {stats.images} images • {stats.videos} videos
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
}