"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOwnCollections } from "@/actions/collection";
import { toast } from "sonner";
import { Collections } from "@/app/components/ui/Collections";
import Button from "@/app/components/Button";
import { createCollection } from "@/actions/collection";
import {
  Plus,
  Search,
  RefreshCw,
  FolderOpen,
  Eye,
  Users,
  Lock,
  Grid,
  List,
  X,
  AlertCircle,
  BookOpen,
  Info,
  Hash,
  Check,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  isDraft: boolean;
  updatedAt: Date;
  postCount: number;
  createdAt: Date;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    followers: 0,
    drafts: 0,
    totalPosts: 0,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [nameError, setNameError] = useState("");

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyOwnCollections();

      if (!response.success) {
        toast.error(response.error?.message || "Failed to load collections");
        return;
      }

      const collectionsData = response.data || [];
      setCollections(collectionsData);

      // Calculate stats
      setStats({
        total: collectionsData.length,
        public: collectionsData.filter((c) => c.visibility === "PUBLIC").length,
        private: collectionsData.filter((c) => c.visibility === "PRIVATE")
          .length,
        followers: collectionsData.filter((c) => c.visibility === "FOLLOWERS")
          .length,
        drafts: collectionsData.filter((c) => c.isDraft).length,
        totalPosts: collectionsData.reduce(
          (acc, c) => acc + (c.postCount || 0),
          0
        ),
      });
    } catch (error) {
      console.error("Failed to load collections:", error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create collection
  const handleCreateCollection = async () => {
    // Validation
    if (!collectionName.trim()) {
      setNameError("Collection name is required");
      toast.error("Please enter a collection name");
      return;
    }

    if (collectionName.trim().length < 2) {
      setNameError("Collection name must be at least 2 characters");
      toast.error("Collection name is too short");
      return;
    }

    if (collectionName.trim().length > 50) {
      setNameError("Collection name must be less than 50 characters");
      toast.error("Collection name is too long");
      return;
    }

    setNameError("");
    setModalLoading(true);

    try {
      const result = await createCollection(collectionName.trim());

      if (result.success) {
        toast.success(`"${collectionName}" created successfully!`);

        // Refresh collections
        await loadCollections();

        // Reset form and close modal
        setCollectionName("");
        setShowCreateModal(false);
      } else {
        toast.error(result.error?.message || "Failed to create collection");
        if (result.error?.code === "DUPLICATE_COLLECTION") {
          setNameError("A collection with this name already exists");
        }
      }
    } catch (error) {
      console.error("Create collection error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  // Validate name on change
  const handleNameChange = (value: string) => {
    setCollectionName(value);
    if (nameError) setNameError("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && collectionName.trim() && !modalLoading) {
      handleCreateCollection();
    }
    if (e.key === "Escape" && !modalLoading) {
      setShowCreateModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#5865F2]/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your collections...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Organizing your curated content
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5865F2] to-[#94BBFF] rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      My Collections
                    </h1>
                    <p className="text-gray-600">
                      Organize and manage your curated snippets
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="theme-primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                New Collection
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[#5865F2]/10 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-[#5865F2]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Posts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalPosts}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
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
                    <Eye className="w-5 h-5 text-blue-600" />
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

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Followers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.followers}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
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
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
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
                      placeholder="Search collections by name or description..."
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
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-[#5865F2] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
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
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    onClick={loadCollections}
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
          {collections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-[#5865F2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-10 h-10 text-[#5865F2]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No collections yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create collections to organize your snippets, tutorials, and
                  discoveries in one place.
                </p>
                <Button
                  variant="theme-primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Collection
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Collections help you organize content for different projects or
                  topics
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {filteredCollections.length}{" "}
                    {filteredCollections.length === 1
                      ? "collection"
                      : "collections"}
                  </span>
                  {searchQuery && (
                    <span className="ml-2 text-sm text-gray-500">
                      matching &quot;
                      <span className="font-medium">{searchQuery}</span>&quot;
                    </span>
                  )}
                </div>
                {filteredCollections.length < collections.length && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-[#5865F2] hover:text-[#4854e0]"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* Collections Component */}
              <Collections
                collections={filteredCollections.map((c) => ({
                  ...c,
                  createdAt:
                    c.createdAt instanceof Date
                      ? c.createdAt.toISOString()
                      : c.createdAt,
                  updatedAt:
                    c.updatedAt instanceof Date
                      ? c.updatedAt.toISOString()
                      : c.updatedAt,
                }))}
                showCoverImage={true}
                variant={viewMode}
                compact={false}
              />

              {/* No Results */}
              {filteredCollections.length === 0 && collections.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No matching collections
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No collections found for &quot;
                    <span className="font-medium">{searchQuery}</span>&quot;
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[#5865F2] hover:text-[#4854e0] font-medium"
                  >
                    Clear search and show all collections
                  </button>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          {collections.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing {filteredCollections.length} of {stats.total}{" "}
                    collections
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalPosts} total posts across all collections
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filteredCollections.length < 20}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !modalLoading && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5865F2] to-[#94BBFF] text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Create Collection</h2>
                      <p className="text-white/80 text-sm">
                        Just a name is enough to get started
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !modalLoading && setShowCreateModal(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                    disabled={modalLoading}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Quick Setup
                      </p>
                      <p className="text-sm text-blue-700">
                        Start with just a name. You can add a description, cover
                        image, and adjust privacy settings later.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-semibold text-gray-900">
                    <Hash className="w-5 h-5 text-[#5865F2]" />
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g., React Tips, Design Resources, Tutorials"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg ${
                      nameError
                        ? "border-red-300 focus:ring-red-500/30 focus:border-red-500"
                        : "border-gray-300 focus:ring-[#5865F2]/30 focus:border-[#5865F2]"
                    }`}
                    disabled={modalLoading}
                    autoFocus
                  />
                  {nameError ? (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {nameError}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Name must be 2-50 characters</span>
                    </div>
                  )}
                </div>

                {/* Default Settings Info */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Default Settings:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <Lock className="w-3 h-3 text-gray-500" />
                      </div>
                      <span>Private</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-gray-500" />
                      </div>
                      <span>Not a Draft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => !modalLoading && setShowCreateModal(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="theme-primary"
                    className="flex-1"
                    onClick={handleCreateCollection}
                    disabled={modalLoading || !collectionName.trim()}
                    icon={
                      modalLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )
                    }
                  >
                    {modalLoading ? "Creating..." : "Create Collection"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to create • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}