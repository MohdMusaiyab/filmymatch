"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserCollectionNames,
  addNewPostToCollection,
  createCollection,
} from "@/actions/collection";
import { toast } from "sonner";
import { Plus, X, Check, Search, FolderPlus, FolderOpen, Bookmark } from "lucide-react";
import Button from "@/app/components/Button";

interface Props {
  postId: string;
  userId: string;
}

const AddCollectionButton = ({ postId }: Props) => {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<
    { id: string; name: string; isDraft: boolean; containsPost: boolean }[]
  >([]);
  const [search, setSearch] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    const res = await getUserCollectionNames(postId);
    if (res.success) {
      setCollections(res.data || []);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      fetchCollections();
    }
  }, [open, fetchCollections]);

  const handleAddToCollection = async (collectionId: string) => {
    setLoading(true);
    const res = await addNewPostToCollection(collectionId, postId);
    if (res.success) {
      toast.success("Added to collection!");
      
      // Update local state
      setCollections(prev => 
        prev.map(col => 
          col.id === collectionId 
            ? { ...col, containsPost: true } 
            : col
        )
      );
      
    } else {
      toast.error(res.error?.message || "Failed to add to collection");
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    
    setCreating(true);
    const res = await createCollection(newCollectionName.trim());
    if (res.success && res.data?.id) {
      toast.success("Collection created!");
      
      // Add new collection to list and select it
      const newCollection = {
        id: res.data.id,
        name: newCollectionName.trim(),
        isDraft: false,
        containsPost: false
      };
      
      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName("");
      
      // Auto-add to the newly created collection
      setTimeout(() => {
        handleAddToCollection(res.data.id);
      }, 300);
      
    } else {
      toast.error(res.error?.message ?? "Failed to create collection");
    }
    setCreating(false);
  };

  const filtered = collections.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Trigger Button - This stays as is since it's used in Snippet dropdown */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary cursor-pointer transition"
      >
        <Plus size={16} className="mr-2" />
        Add to Collection
      </button>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#5865F2] to-[#94BBFF] text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Collection</h2>
                      <p className="text-white/80 text-sm">Organize this snippet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30 focus:border-[#5865F2]"
                  />
                </div>

                {/* Collections List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Your Collections
                    </span>
                    <span className="text-xs text-gray-500">
                      {filtered.length} total
                    </span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto pr-2">
                    {filtered.length === 0 ? (
                      <div className="text-center py-6">
                        <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                          {search ? 'No matching collections' : 'No collections yet'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filtered.map((col) => (
                          <div
                            key={col.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              col.containsPost
                                ? 'bg-green-50 border-green-200'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                col.containsPost
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-[#5865F2]/10 text-[#5865F2]'
                              }`}>
                                {col.containsPost ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <FolderOpen className="w-4 h-4" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900 truncate">
                                {col.name}
                              </span>
                              {col.isDraft && (
                                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                  Draft
                                </span>
                              )}
                            </div>
                            
                            {col.containsPost ? (
                              <div className="flex items-center text-green-600 text-sm">
                                <Check className="w-4 h-4 mr-1" />
                                Added
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleAddToCollection(col.id)}
                                variant="theme-primary"
                                size="sm"
                                disabled={loading}
                                className="whitespace-nowrap"
                              >
                                {loading ? 'Adding...' : 'Add'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Create New Collection */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FolderPlus className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">Create New Collection</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Enter collection name..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30 focus:border-[#5865F2]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCollectionName.trim()) {
                          handleCreateCollection();
                        }
                      }}
                    />
                    <Button
                      onClick={handleCreateCollection}
                      variant="theme-gradient"
                      disabled={creating || !newCollectionName.trim()}
                      icon={creating ? null : <Plus className="w-4 h-4" />}
                      className="whitespace-nowrap"
                    >
                      {creating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Collections help you organize snippets by topic or project
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddCollectionButton;