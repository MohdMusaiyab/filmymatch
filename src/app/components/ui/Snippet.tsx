import {
  MoreVertical,
  Edit,
  Trash,
  Share,
  MessageCircle,
  Heart,
  Ellipsis,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import AddCollectionButton from "../AddCollectionButton";
import { ToggleSaveButton } from "../ToggleSaveButton";
import LikeButton from "../LikeButton"
import { useSession } from "next-auth/react";
import { Post } from "@/types/Post";
import { Visibility } from "@/types";
import { VisibilityTag } from "../VisibilityTag";

interface SnippetProps {
  post: Post;
  menuOpen: string | null;
  toggleMenu: (id: string) => void;
  showActions?: boolean;
}

export const Snippet = ({ post, menuOpen, toggleMenu }: SnippetProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  function timeAgo(date: string | Date): string {
    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) return "";

    const seconds = Math.floor((Date.now() - inputDate.getTime()) / 1000);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;

    const years = Math.floor(days / 365);
    return `${years}y`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow" onClick={()=>{post.linkTo ? post.linkTo : `/explore/post/${post.id}`}}>
      <div className="relative h-48 w-full">
        {/* Cover Image OR Dummy Placeholder */}
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FileText size={48} className="text-primary/80" />
          </div>
        )}

        {/* Top-right Buttons (always visible) */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <ToggleSaveButton postId={post.id} initialIsSaved={post.isSaved} />

          <div className="relative">
            <button
              onClick={() => toggleMenu(post.id)}
              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition hover:bg-white hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen === post.id}
            >
              <Ellipsis size={18} color="#4b5563" />
            </button>

            {menuOpen === post.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 py-1 animate-fade-in">
                <AddCollectionButton postId={post.id} userId={post.user.id} />

                {userId === post.user.id && (
                  <>
                    <Link
                      href={`/dashboard/my-posts/${post.id}`}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Link>

                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-primary/10 hover:text-primary transition">
                      <Trash size={16} className="mr-2" />
                      Delete
                    </button>
                  </>
                )}

                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition">
                  <Share size={16} className="mr-2" />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {/* User Avatar */}
          <Link href={`/profile/${post.user.id}`}>
            <div className="w-8 h-8 bg-primary/20 overflow-hidden rounded-full">
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
          <div>
            <Link href={`/profile/${post.user.id}`}>
              <h4 className="font-semibold text-gray-900">
                {post.user.username}
              </h4>
            </Link>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <Link href={post.linkTo ? post.linkTo : `/explore/post/${post.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4">{post.description}</p>

        <div className="flex items-center justify-between">
          <VisibilityTag visibility={post.visibility as Visibility} />
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <LikeButton postId={post.id}/>
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={18} />
              {post._count?.comments ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
