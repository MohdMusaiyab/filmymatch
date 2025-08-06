"use client"
import React, { useState, useEffect } from 'react'
import { Snippet } from '@/app/components/ui/Snippet'
import { getSavedPosts } from '@/actions/save'
import { Search, BookmarkCheck, AlertCircle } from 'lucide-react'

interface SavedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage?: string | null;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  images: {
    id: string;
    url: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    postId: string;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string | Date;
  updatedAt: Date;
  linkTo?: string;
  isSaved: boolean;
  userId: string;
}

interface SavedPostsResponse {
  success: boolean;
  data?: {
    posts: SavedPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: {
    message: string;
    code: string;
  };
  code?: string;
}

const SavedPostsPage = () => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const limit = 10;

  const fetchSavedPosts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(page === 1);
      setSearchLoading(search !== '');
      
      const response: SavedPostsResponse = await getSavedPosts({
        page,
        limit,
        search: search.trim()
      });

      if (response.success && response.data) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination.pages);
        setTotalPosts(response.data.pagination.total);
        setError(null);
      } else {
        setError(response.error?.message || 'Failed to fetch saved posts');
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      setPosts([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts(currentPage, searchTerm);
  }, [currentPage,searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSavedPosts(1, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookmarkCheck className="text-blue-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Saved Posts</h1>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search your saved posts..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              {totalPosts === 0 
                ? 'No saved posts found' 
                : `${totalPosts} saved post${totalPosts === 1 ? '' : 's'} found`}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {posts.map((post) => (
                <Snippet
                  key={post.id}
                  post={{
                    ...post,
                    createdAt: typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString(),
                    user: {
                      ...post.user,
                      avatar: post.user.avatar || undefined
                    },
                    images: post.images.map(img => ({
                      id: img.id,
                      url: img.url,
                      description: img.description || undefined
                    })),
                    coverImage: post.coverImage || undefined,
                    linkTo: `/dashboard/saved-posts/${post.id}` // Custom link for saved posts
                  }}
                  menuOpen={menuOpen}
                  toggleMenu={toggleMenu}
                  showActions={true}
                />
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          !loading && !error && (
            <div className="text-center py-20">
              <BookmarkCheck className="mx-auto text-gray-600 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchTerm ? 'No matching posts found' : 'No saved posts yet'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all your saved posts.'
                  : 'Start saving posts you like and they\'ll appear here for easy access later.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    fetchSavedPosts(1, '');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;