"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserCollectionNames,
  addNewPostToCollection,
  createCollection,
} from "@/actions/collection";
import { toast } from "sonner";
import { Plus, X, Check } from "lucide-react";

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

  const fetchCollections = useCallback(async () => {
    const res = await getUserCollectionNames(postId);
    if (res.success) {
      setCollections(res.data || []);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      const fetchCollections = async () => {
        const res = await getUserCollectionNames(postId);
        if (res.success) {
          setCollections(res.data || []);
        }
      };
      fetchCollections();
    }
  }, [open, postId]);

  const handleAddToCollection = async (collectionId: string) => {
    setLoading(true);
    const res = await addNewPostToCollection(collectionId, postId);
    if (res.success) {
      toast.success("Post added to collection");
      setOpen(false);
    } else {
      toast.error(res.error?.message || "An unknown error occurred");
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    setLoading(true);
    const res = await createCollection(newCollectionName.trim());
    if (res.success) {
      toast.success("Collection created");
      setNewCollectionName("");
      await fetchCollections();
    } else {
      toast.error(res.error?.message ?? "An unknown error occurred");
    }
    setLoading(false);
  };

  const filtered = collections.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center w-full px-4 py-2 rounded-md bg-primary text-sm text-gray-700 hover:bg-primary/90 transition"
      >
        <Plus size={16} className="mr-2"/>
        Add to Collection
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className=" w-full max-w-md rounded-2xl p-6 shadow-xl relative"
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4">Add to Collection</h2>

              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections..."
                className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Collection List */}
              <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No collections found.
                  </p>
                ) : (
                  filtered.map((col) => (
                    <div
                      key={col.id}
                      className="flex justify-between items-center border px-3 py-2 rounded-md"
                    >
                      <span className="truncate">{col.name}</span>
                      {col.containsPost ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Check size={14} /> Added
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCollection(col.id)}
                          disabled={loading}
                          className="text-sm px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* New Collection */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name"
                    className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleCreateCollection}
                    disabled={loading || !newCollectionName.trim()}
                    className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    <Plus size={18} />
                  </button>
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
