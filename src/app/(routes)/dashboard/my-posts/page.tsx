"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  images: {
    id: string;
    url: string;
    description: string | null;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts/my-posts?page=1&limit=10")
      .then((res) => {
        setPosts(res.data.posts);
      })
      .catch((err) => {
        console.error("Failed to load posts:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Posts</h1>

      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post: Post) => (
          <div
            key={post.id}
            className="border rounded-xl p-4 shadow-md bg-white"
          >
            <h2 className="text-xl font-semibold">
              <Link href={`/dashboard/my-posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 mb-2">{post.description}</p>
            <p className="text-sm text-blue-500">Category: {post.category}</p>
            <p className="text-sm text-gray-500">
              Visibility: {post.visibility}
            </p>

            {post.coverImage && (
              <img
                src={post.coverImage}
                alt="Cover"
                className="w-full h-60 object-cover mt-2 rounded-md"
              />
            )}

            <div className="text-sm mt-4 text-gray-700">
              <span>By {post.user.username}</span> •{" "}
              <span>{post._count.likes} Likes</span> •{" "}
              <span>{post._count.comments} Comments</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostsPage;
