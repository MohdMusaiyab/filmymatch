// components/Snippet.tsx
import { MoreVertical, Edit, Trash, Share } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddCollectionButton from "../AddCollectionButton";
import { ToggleSaveButton } from "../ToggleSaveButton";
import { useSession } from "next-auth/react";
import { Post } from "@/types/Post";

interface SnippetProps {
  // post: {
  //   id: string;
  //   title: string;
  //   description: string;
  //   category: string;
  //   visibility: string;
  //   coverImage?: string;
  //   user: {
  //     id: string;
  //     username: string;
  //     avatar?: string | null;
  //   };
  //   images: {
  //     id: string;
  //     url: string;
  //     description?: string | null;
  //   }[];
  //   _count: {
  //     likes: number;
  //     comments: number;
  //   };
  //   createdAt: string;
  //   linkTo?: string; // ✅ new prop to allow dynamic link
  //   isSaved: boolean; // ✅ Add this
  // };
  post: Post;
  menuOpen: string | null;
  toggleMenu: (id: string) => void;
  showActions?: boolean;
}

export const Snippet = ({ post, menuOpen, toggleMenu }: SnippetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt="Cover"
          width={800}
          height={192}
          className="w-full h-48 object-cover rounded-t-2xl"
          style={{ width: "100%", height: "12rem" }}
          priority
        />
      )}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Link href={`/profile/${post.user.id}`}>
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center overflow-hidden">
              {post.user.avatar ? (
                <Image
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-2xl">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center">
                <Link
                href={post.linkTo ? post.linkTo : `/explore/post/${post.id}`}
                className="min-w-0"
                >
                <h3 className="text-white  text-lg font-semibold leading-tight hover:underline">
                  {post.title}
                </h3>
              </Link>
              <div className="flex justify-center align center">
                <ToggleSaveButton
                  postId={post.id}
                  initialIsSaved={post.isSaved}
                />

                {/* Dropdown Trigger - Exactly like your previous example */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu(post.id)}
                    className="py-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="More options"
                    aria-haspopup="true"
                    aria-expanded={menuOpen === post.id}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu - Exactly like your previous example */}
                  {menuOpen === post.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-30 py-1 animate-fade-in">
                      {/* add to collection */}
                      <AddCollectionButton
                        postId={post.id}
                        userId={post.user.id}
                      />
                      {/* show edit & delete only if it's own post */}
                      {userId === post.user.id && (
                        <>
                          <Link
                            href={`/dashboard/my-posts/${post.id}`}
                            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 transition rounded-md"
                          >
                            <Edit size={16} className="mr-2" />
                            Edit
                          </Link>

                          <button className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition rounded-md">
                            <Trash size={16} className="mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                      <button className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 transition rounded-md">
                        <Share size={16} className="mr-2" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-2 flex flex-col items-start gap-2 text-sm text-gray-400">
              <span className="inline-block bg-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                {post.category}
              </span>
              <div className="flex gap-2">
                <span className="truncate">@{post.user.username}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <p className="text-gray-300 italic leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
              <span>{post._count?.likes ?? 0} Likes</span>
              <span>{post._count?.comments ?? 0} Comments</span>
              <span className="capitalize">
                {post.visibility.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
