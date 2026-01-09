"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TagsEnum } from "@/schemas/common";
import { CategoryEnum } from "@/schemas/common";
import { Snippet } from "@/app/components/ui/Snippet";
import api from "@/lib/api";
import { Post } from "@/types/Post";
import Button from "@/app/components/Button";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Users,
  Loader2,
  RefreshCw,
  Plus,
  Hash,
} from "lucide-react";

interface ApiResponse {
  success: boolean;
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

// Loading skeleton component matching your design
const PostSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoized filter state
  const filterState = useMemo(
    () => ({
      searchTerm,
      selectedTags,
      selectedCategories,
      showFollowing,
    }),
    [searchTerm, selectedTags, selectedCategories, showFollowing]
  );

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 500);
  }, []);

  const toggleMenu = useCallback(
    (id: string) => {
      setMenuOpen(menuOpen === id ? null : id);
    },
    [menuOpen]
  );

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1);
  }, []);

  const toggleFollowing = useCallback(() => {
    setShowFollowing(!showFollowing);
    setPage(1);
  }, [showFollowing]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setShowFollowing(false);
    setPage(1);
  }, []);

  const fetchPosts = useCallback(
    async (pageNum: number = page, isLoadMore: boolean = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const params = new URLSearchParams();
        params.append("page", pageNum.toString());
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        selectedTags.forEach((tag) => params.append("tags", tag));
        selectedCategories.forEach((cat) => params.append("category", cat));
        if (showFollowing) params.append("visibility", "FOLLOWERS");

        const response = await api.get(`/posts?${params.toString()}`);

        const data: ApiResponse = response.data;

        if (!data.success) {
          throw new Error("Failed to fetch posts");
        }

        const newPosts = data.data?.posts || [];
        const pagination = data.data?.pagination;

        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        if (pagination) {
          setHasMore(pagination.page < pagination.pages);
        } else {
          setHasMore(newPosts.length > 0);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch posts"
        );
        if (pageNum === 1) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsInitialLoad(false);
      }
    },
    [searchTerm, selectedTags, selectedCategories, showFollowing, page]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState, fetchPosts]);

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page, true);
  }, [page, fetchPosts]);

  const activeFiltersCount = useMemo(
    () =>
      selectedTags.length + selectedCategories.length + (showFollowing ? 1 : 0),
    [selectedTags.length, selectedCategories.length, showFollowing]
  );

  const renderedPosts = useMemo(
    () =>
      posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="h-full"
        >
          <Snippet
            post={{ ...post, linkTo: `/explore/post/${post.id}` }}
            menuOpen={menuOpen}
            toggleMenu={toggleMenu}
            showActions={false}
          />
        </motion.div>
      )),
    [posts, menuOpen, toggleMenu]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#5865F2] to-[#94BBFF] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Explore Snippets
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Discover amazing code snippets, tutorials, and resources from
              developers worldwide
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title, description, or tags..."
                  defaultValue={searchTerm}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30 focus:border-[#5865F2] text-gray-900 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Categories Dropdown */}
              <div className="relative">
                <Button
                  variant={
                    selectedCategories.length > 0 ? "theme-primary" : "outline"
                  }
                  size="md"
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-2"
                >
                  Categories
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showCategories ? "rotate-180" : ""
                    }`}
                  />
                  {selectedCategories.length > 0 && (
                    <span className="ml-1 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-xs">
                      {selectedCategories.length}
                    </span>
                  )}
                </Button>
                {showCategories && (
                  <div className="absolute z-30 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 max-h-60 overflow-y-auto hide-scrollbar">
                    {CategoryEnum.options.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${
                          selectedCategories.includes(category)
                            ? "text-primary font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {category}
                        {selectedCategories.includes(category) && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Dropdown */}
              <div className="relative">
                <Button
                  variant={
                    selectedTags.length > 0 ? "theme-primary" : "outline"
                  }
                  size="md"
                  icon={<Hash className="w-4 h-4" />}
                  onClick={() => setShowTags(!showTags)}
                  className="flex items-center gap-2"
                >
                  Tags
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showTags ? "rotate-180" : ""
                    }`}
                  />
                  {selectedTags.length > 0 && (
                    <span className="ml-1 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-xs">
                      {selectedTags.length}
                    </span>
                  )}
                </Button>
                {showTags && (
                  <div className="absolute z-30 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 max-h-60 overflow-y-auto hide-scrollbar">
                    {TagsEnum.options.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center justify-between ${
                          selectedTags.includes(tag)
                            ? "text-primary font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        #{tag.toLowerCase()}
                        {selectedTags.includes(tag) && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Following Toggle */}
              <Button
                variant={showFollowing ? "theme-primary" : "outline"}
                size="md"
                icon={<Users className="w-4 h-4" />}
                onClick={toggleFollowing}
              >
                Following
              </Button>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  icon={<X className="w-4 h-4" />}
                  onClick={clearAllFilters}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Chips */}
          {(selectedTags.length > 0 || selectedCategories.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <div
                    key={category}
                    className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {category}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="hover:text-primary/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    #{tag.toLowerCase()}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-red-200 p-6 text-center mb-8"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Posts
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              variant="theme-primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchPosts(1, false)}
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && isInitialLoad && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Posts Grid */}
        <AnimatePresence mode="wait">
          {!loading && posts.length > 0 && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Results Info */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {posts.length} {posts.length === 1 ? "Snippet" : "Snippets"}{" "}
                  Found
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600">
                    Filtered by {activeFiltersCount} criteria
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderedPosts}
              </div>

              {/* Load More */}
              {hasMore && !loadingMore && (
                <div className="text-center pt-8">
                  <Button
                    variant="theme-primary"
                    size="lg"
                    onClick={() => setPage((prev) => prev + 1)}
                    className="min-w-[200px]"
                  >
                    Load More Snippets
                  </Button>
                </div>
              )}

              {/* Loading More */}
              {loadingMore && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more snippets...</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && !isInitialLoad && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Snippets Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeFiltersCount > 0
                ? "Try adjusting your filters to see more results"
                : "Be the first to create a snippet in this category!"}
            </p>
            {activeFiltersCount > 0 ? (
              <Button
                variant="theme-primary"
                size="lg"
                icon={<Filter className="w-5 h-5" />}
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            ) : (
              <Button
                variant="theme-primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                onClick={() =>
                  (window.location.href = "/dashboard/create-post")
                }
              >
                Create Your First Snippet
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
