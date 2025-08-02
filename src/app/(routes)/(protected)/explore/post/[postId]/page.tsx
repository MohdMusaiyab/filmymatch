"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Bookmark, BookmarkCheck, Heart } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import api from '@/lib/api'

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage?: string | null;
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

export default function PostPage() {
  const { postId } = useParams() as { postId: string };
  const [post, setPost] = useState<Post | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        const response = await api.get(`/posts/${postId}`);
        const data = response.data;
        if (data.success) setPost(data.data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      }
    }

    fetchPost();
  }, [postId]);

  if (!post) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          {post.user?.avatar ? (
            <Image
              src={post.user.avatar}
              alt={post.user.username}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              {post.user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium">{post.user.username}</span>
        </div>
        <span>&bull;</span>
        <span className="capitalize">{post.visibility}</span>
        <span>&bull;</span>
        <span className="capitalize">{post.category}</span>
        <span>&bull;</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      <p className="text-lg text-white leading-relaxed mb-8">
        {/* slice it to some length and then style the preview to show the full desc */}
        {post.description}
      </p>

      {/* Images and Descriptions Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {post.images?.map((img) => (
          <div
            key={img.id}
            className="rounded-lg overflow-hidden transition border border-gray-700"
          >
            {post.images && (
              <div className="relative w-full h-56">
                <Image
                  src={img.url}
                  alt="Post image"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover cursor-pointer"
                  onClick={() => setPreviewImg(img.url)}
                  priority
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-gray-300">
                {img.description || "No description available."}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 text-gray-600 border-t pt-4">
        <div className="flex items-center gap-2 hover:text-red-500 cursor-pointer">
          <Heart className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
          <span>{post.isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}</span>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Transition.Root show={!!previewImg} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setPreviewImg(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-black shadow-xl transition-all w-full max-w-3xl">
                  {previewImg && (
                    <Image
                      src={previewImg}
                      alt="Preview"
                      width={1200}
                      height={800}
                      className="w-full object-contain max-h-[80vh] bg-black"
                    />
                  )}

                  <button
                    onClick={() => setPreviewImg(null)}
                    className="absolute top-2 right-2 text-white cursor-pointer rounded-full"
                  >
                    ✕
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
