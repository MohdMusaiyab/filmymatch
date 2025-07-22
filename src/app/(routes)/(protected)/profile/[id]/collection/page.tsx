"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound, redirect } from "next/navigation";
import { toast } from "sonner";
import { getUserCollections } from "@/actions/collection";
import { Snippet } from "@/app/components/ui/Snippet";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  posts: {
    id: string;
    title: string;
    coverImage: string | null;
    visibility: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    isSaved: boolean;
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
  }[];
}

const UserCollectionsPage = () => {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const result = await getUserCollections(userId);

        if (!result.success) {
          if (result.error?.code === "UNAUTHORIZED") {
            redirect("/login");
          }

          toast.error(result.error?.message || "Failed to fetch collections");
          return;
        }
        // Fix this, ensure collections are set correctly
        setCollections(
          (result.data || []).map((collection: any) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description,
            coverImage: collection.coverImage,
            visibility: collection.visibility,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
            userId: collection.userId,
            posts: collection.posts.map((post: any) => ({
              id: post.id,
              title: post.title,
              coverImage: post.coverImage,
              visibility: post.visibility,
              userId: post.userId,
              createdAt: post.createdAt,
              isSaved: post.isSaved,
              updatedAt: post.updatedAt,
              user: {
                id: post.user.id,
                username: post.user.username,
                avatar: post.user.avatar,
              },
            })),
          }))
        );
      } catch (err) {
        toast.error("Something went wrong while loading collections");
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
        This user has no visible collections.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">User's Collections</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Snippet
            key={collection.id}
            post={{
              id: collection.id,
              title: collection.name,
              description: collection.description || "No description",
              category: "Collection",
              visibility: collection.visibility,
              coverImage: collection.coverImage || undefined,
              user: {
                id: collection.userId,
                username: "", // optionally fetch username if needed
                avatar: undefined,
              },
              images: [],
              _count: {
                likes: 0,
                comments: 0,
              },
              createdAt: collection.createdAt,
              // remove isSaved as it is not required for a collection
              isSaved: false,
              linkTo: `/explore/collection/${collection.id}`,
            }}
            menuOpen={null}
            toggleMenu={() => {}}
            showActions={false}
          />
        ))}
      </div>
    </div>
  );
};

export default UserCollectionsPage;
