"use client";

import { useEffect, useState } from "react";
import { getMyOwnCollections, deleteCollection } from "@/actions/collection";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_COVER_IMAGE =
  "https://thumbs.dreamstime.com/b/book-open-cover-reveals-tree-growing-its-pages-bathed-radiant-light-ideal-fantasy-nature-themed-book-354676529.jpg";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  isDraft: boolean;
  updatedAt: Date;
  postCount: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      const response = await getMyOwnCollections();

      if (!response.success) {
        toast.error(response.error?.message || "Failed to load collections");
        return;
      }

      setCollections(response.data || []);
      setLoading(false);
    };

    loadCollections();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this collection?");
    if (!confirm) return;

    const result = await deleteCollection(id);
    if (result.success) {
      toast.success("Collection deleted");
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error(result.error?.message || "Failed to delete collection");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Collections</h1>

      {collections.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl">No collections found</p>
          <p className="mt-2">Create your first collection to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors relative group"
            >
              <div className="relative h-48 w-full bg-gray-700">
                <Image
                  src={collection.coverImage || DEFAULT_COVER_IMAGE}
                  alt={collection.name}
                  fill
                  className={`object-cover ${
                    !collection.coverImage ? "opacity-50" : ""
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <Link
                    href={`/dashboard/my-collection/${collection.id}`}
                    className="text-xl font-semibold text-white truncate hover:text-blue-400 transition-colors"
                  >
                    {collection.name}
                  </Link>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {collection.postCount} {collection.postCount === 1 ? "post" : "posts"}
                  </span>
                </div>

                {collection.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex justify-between items-center mt-4 text-xs">
                  <span className="text-gray-500">
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        collection.visibility === "PUBLIC"
                          ? "bg-green-900/20 text-green-400"
                          : collection.visibility === "FOLLOWERS"
                          ? "bg-blue-900/20 text-blue-400"
                          : "bg-purple-900/20 text-purple-400"
                      }`}
                    >
                      {collection.visibility.toLowerCase()}
                    </span>
                    {collection.isDraft && (
                      <span className="bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded-full">
                        draft
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(collection.id)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-4 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
