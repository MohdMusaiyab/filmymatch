'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TagsEnum } from '@/schemas/common'
import { CategoryEnum } from '@/schemas/common'
import { Snippet } from '@/app/components/ui/Snippet'

interface Post {
  id: string
  title: string
  description: string
  category: string
  visibility: string
  coverImage?: string
  user: {
    id: string
    username: string
    avatar?: string | null
  }
  images: {
    id: string
    url: string
    description?: string | null
  }[]
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
  isSaved: boolean;
}

interface ApiResponse {
  success: boolean
  data: {
    posts: Post[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFollowing, setShowFollowing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    setPage(1)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    )
    setPage(1)
  }

  const toggleFollowing = () => {
    setShowFollowing(!showFollowing)
    setPage(1)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedTags([])
    setSelectedCategories([])
    setShowFollowing(false)
    setPage(1)
  }

  const fetchPosts = async (pageNum: number = page, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }
      
      const params = new URLSearchParams()
      params.append('page', pageNum.toString())
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      selectedTags.forEach(tag => params.append('tags', tag))
      selectedCategories.forEach(cat => params.append('category', cat))
      if (showFollowing) params.append('visibility', 'FOLLOWERS')

      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to fetch posts')
      }

      const newPosts = data.data?.posts || []
      const pagination = data.data?.pagination

      if (pageNum === 1) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      // Check if there are more pages
      if (pagination) {
        setHasMore(pagination.page < pagination.pages)
      } else {
        setHasMore(newPosts.length > 0)
      }
      
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch posts')
      if (pageNum === 1) {
        setPosts([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedTags, selectedCategories, showFollowing])

  useEffect(() => {
    if (page === 1) return // Skip initial page load
    fetchPosts(page, true)
  }, [page])

  const activeFiltersCount = selectedTags.length + selectedCategories.length + (showFollowing ? 1 : 0)

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to 5ocial
        </h1>
      </motion.div>
      
      {/* Search and Filters */}
      <motion.div 
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">
            🔍
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={toggleFollowing}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              showFollowing 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            My Following
          </button>
          
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Clear All ({activeFiltersCount})
            </motion.button>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {CategoryEnum?.options?.map(category => (
              <motion.button
                key={category}
                onClick={() => toggleCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {category}
              </motion.button>
            )) || (
              <p className="text-gray-500 text-sm">No categories available</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {TagsEnum?.options?.map(tag => (
              <motion.button
                key={tag}
                onClick={() => toggleTag(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tag}
              </motion.button>
            )) || (
              <p className="text-gray-500 text-sm">No tags available</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => fetchPosts(1, false)}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        {loading && page === 1 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading posts...</p>
          </motion.div>
        ) : !posts || posts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-2">No posts found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Snippet
                  post={{ ...post, linkTo: `/explore/post/${post.id}` }} // ✅ inject linkTo
                  menuOpen={menuOpen}
                  toggleMenu={toggleMenu}
                  showActions={false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More */}
      {hasMore && !loading && posts && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default FeedPage