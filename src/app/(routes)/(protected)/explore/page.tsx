"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TagsEnum } from "@/schemas/common";
import { CategoryEnum } from "@/schemas/common";
import { Snippet } from "@/app/components/ui/Snippet";
import api from '@/lib/api'
import { Post } from "@/types/Post";
// interface Post {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   visibility: string;
//   coverImage?: string;
//   user: {
//     id: string;
//     username: string;
//     avatar?: string | null;
//   };
//   images: {
//     id: string;
//     url: string;
//     description?: string | null;
//   }[];
//   _count: {
//     likes: number;
//     comments: number;
//   };
//   createdAt: string;
//   isSaved: boolean;
// }

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

// Loading skeleton component
const PostSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg p-6 mb-4">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
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
);

const FeedPage = () => {
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

  // Memoized filter state to prevent unnecessary re-renders
  const filterState = useMemo(
    () => ({
      searchTerm,
      selectedTags,
      selectedCategories,
      showFollowing,
    }),
    [searchTerm, selectedTags, selectedCategories, showFollowing]
  );

  // Debounced search with proper cleanup
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 500); // Increased debounce time for better performance
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

        // Check if there are more pages
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

  // Optimized useEffect with proper dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState, fetchPosts]);

  useEffect(() => {
    if (page === 1) return; // Skip initial page load
    fetchPosts(page, true);
  }, [page, fetchPosts]);

  // Memoized active filters count
  const activeFiltersCount = useMemo(
    () =>
      selectedTags.length + selectedCategories.length + (showFollowing ? 1 : 0),
    [selectedTags.length, selectedCategories.length, showFollowing]
  );

  // Memoized posts rendering
  const renderedPosts = useMemo(
    () =>
      posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
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
    <div className="mx-auto min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      ></motion.div>

      <div className="relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-20 mb-8">
        {/* search */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            placeholder="Search posts..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full py-2 pl-4 bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
          />
        </div>

        {/* categories dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategories((prev) => !prev)}
            className="px-3 py-2 text-sm border rounded-md whitespace-nowrap"
          >
            Categories ⏷
          </button>
          {showCategories && (
            <div className="absolute z-10 mt-2 max-h-60 overflow-y-auto rounded-md shadow-md p-2 w-64 bg-gray-900">
              {CategoryEnum.options.map((category) => (
                <label key={category} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="mr-2"
                  />
                  {category}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* tags dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTags((prev) => !prev)}
            className="px-3 py-2 text-sm border rounded-md whitespace-nowrap"
          >
            Tags ⏷
          </button>
          {showTags && (
            <div className="absolute z-10 mt-2 max-h-60 overflow-y-auto rounded-md shadow-md p-2 w-64 bg-gray-900 hide-scrollbar">
              {TagsEnum.options.map((tag) => (
                <label key={tag} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    className="mr-2"
                  />
                  #{tag.toLowerCase()}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* following toggle */}
        <label className="flex items-center px-3 py-2 border rounded-md text-sm cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showFollowing}
            onChange={toggleFollowing}
            className="mr-2"
          />
          Following
        </label>

        {/* Clear All */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 text-sm text-red-600 bg-red-100 hover:bg-red-200 rounded-md whitespace-nowrap"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button
            onClick={() => fetchPosts(1, false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && isInitialLoad && (
        <div className="grid grid-cols-1 gap-6 px-24">
          {[...Array(5)].map((_, index) => (
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
            className="grid grid-cols-1 gap-6 px-24"
          >
            {renderedPosts}

            {/* Load More Button */}
            {hasMore && !loadingMore && (
              <motion.button
                onClick={() => {
                  setPage((prev) => prev + 1);
                }}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Load More
              </motion.button>
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">
                  Loading more posts...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && !isInitialLoad && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No posts found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your filters
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
