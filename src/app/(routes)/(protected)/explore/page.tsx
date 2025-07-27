"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TagsEnum } from "@/schemas/common";
import { CategoryEnum } from "@/schemas/common";
import { Snippet } from "@/app/components/ui/Snippet";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage?: string;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  images: {
    id: string;
    url: string;
    description?: string | null;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  isSaved: boolean;
}

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

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const toggleFollowing = () => {
    setShowFollowing(!showFollowing);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedCategories([]);
    setShowFollowing(false);
    setPage(1);
  };

  const fetchPosts = async (
    pageNum: number = page,
    isLoadMore: boolean = false
  ) => {
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

      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

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
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags, selectedCategories, showFollowing]);

  useEffect(() => {
    if (page === 1) return; // Skip initial page load
    fetchPosts(page, true);
  }, [page]);

  const activeFiltersCount =
    selectedTags.length + selectedCategories.length + (showFollowing ? 1 : 0);

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
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>
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
            {posts.map((post, index) => (
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
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;
