import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/types";
import {
  Ellipsis,
  Eye,
  Lock,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
const DEFAULT_COVER_IMAGE =
  "https://thumbs.dreamstime.com/b/book-open-cover-reveals-tree-growing-its-pages-bathed-radiant-light-ideal-fantasy-nature-themed-book-354676529.jpg";
interface CollectionsProps {
  collections: Collection[];
  showCoverImage?: boolean;
  variant?: "grid" | "list";
  compact?: boolean;
}

export const Collections = ({
  collections,
  showCoverImage = false,
  variant = "grid",
  compact = false,
}: CollectionsProps) => {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No collections yet
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Create your first collection to organize your snippets and discoveries
        </p>
        <Link
          href="/dashboard/collections/new"
          className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          Create Collection
        </Link>
      </div>
    );
  }

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

  // Visibility icon mapping
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Eye className="w-4 h-4" />;
      case "PRIVATE":
        return <Lock className="w-4 h-4" />;
      case "FOLLOWERS":
        return <Users className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  // Color gradient based on index (for variety)
  const getGradientClass = (index: number) => {
    const gradients = [
      "from-[#6366f1] via-[#818cf8] to-[#6366f1]", // Your existing purple
      "from-[#10b981] via-[#34d399] to-[#10b981]", // Emerald
      "from-[#f59e0b] via-[#fbbf24] to-[#f59e0b]", // Amber
      "from-[#8b5cf6] via-[#a78bfa] to-[#8b5cf6]", // Violet
      "from-[#06b6d4] via-[#22d3ee] to-[#06b6d4]", // Cyan
      "from-[#ec4899] via-[#f472b6] to-[#ec4899]", // Pink
    ];
    return gradients[index % gradients.length];
  };

  // Grid variant (default)
  if (variant === "grid") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${
          compact ? "gap-3" : "gap-4"
        }`}
      >
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className={`
              relative group overflow-hidden rounded-xl transition-all duration-300
              hover:shadow-lg hover:-translate-y-1
              ${compact ? "p-4" : "p-5"}
              ${
                showCoverImage
                  ? "bg-white border border-gray-200"
                  : `bg-gradient-to-br ${getGradientClass(index)}`
              }
            `}
          >
            <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
              <Image
                src={collection.coverImage || DEFAULT_COVER_IMAGE}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/explore/collection/${collection.id}`}>
                  <h4
                    className={`
                    font-semibold truncate mb-1
                    ${showCoverImage ? "text-gray-900" : "text-white"}
                    ${compact ? "text-base" : "text-lg"}
                  `}
                  >
                    #{collection.name}
                  </h4>
                </Link>
                <p
                  className={`
                  text-sm mb-2 line-clamp-2
                  ${showCoverImage ? "text-gray-600" : "text-white/90"}
                `}
                >
                  {collection.description || "No description"}
                </p>
              </div>

              {!compact && (
                <button className="ml-2 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <Ellipsis
                    className={`w-4 h-4 ${
                      showCoverImage ? "text-gray-600" : "text-white"
                    }`}
                  />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div
                  className={`
                  flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                  ${
                    showCoverImage
                      ? "bg-gray-100 text-gray-700"
                      : "bg-white/20 text-white backdrop-blur-sm"
                  }
                `}
                >
                  {getVisibilityIcon(collection.visibility)}
                  <span className="capitalize ml-1">
                    {collection.visibility.toLowerCase()}
                  </span>
                </div>

                <div
                  className={`
                  flex items-center gap-1 text-xs
                  ${showCoverImage ? "text-gray-500" : "text-white/80"}
                `}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{collection.postCount || 0}</span>
                </div>
              </div>

              {compact ? (
                <ChevronRight
                  className={`w-4 h-4 ${
                    showCoverImage ? "text-gray-400" : "text-white/60"
                  }`}
                />
              ) : (
                <div
                  className={`
                  text-xs
                  ${showCoverImage ? "text-gray-500" : "text-white/70"}
                `}
                >
                  {timeAgo(collection.createdAt)}
                </div>
              )}
            </div>

            {/* Hover overlay for actions */}
            {!compact && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link
                  href={`/dashboard/my-collection/${collection.id}`}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                >
                  Edit
                </Link>
                <Link
                  href={`/explore/collection/${collection.id}`}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  View
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // List variant
  return (
    <div className="space-y-3">
      {collections.map((collection, index) => (
        <Link
          key={collection.id}
          href={`/explore/collection/${collection.id}`}
          className={`
            flex items-center gap-4 p-4 rounded-xl transition-all duration-200
            hover:shadow-md hover:bg-gray-50 border border-transparent hover:border-gray-200
            ${compact ? "py-3" : "p-4"}
          `}
        >
          {showCoverImage && collection.coverImage ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div
              className={`
              w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center
              ${compact ? "w-12 h-12" : "w-16 h-16"}
              bg-gradient-to-br ${getGradientClass(index)}
            `}
            >
              <span
                className={`font-bold ${
                  compact ? "text-lg" : "text-xl"
                } text-white`}
              >
                {collection.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                #{collection.name}
              </h4>
              <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                {getVisibilityIcon(collection.visibility)}
                <span className="capitalize ml-1">
                  {collection.visibility.toLowerCase()}
                </span>
              </div>
            </div>

            {collection.description && (
              <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {collection.postCount || 0} posts
              </span>
              <span>•</span>
              <span>Created {timeAgo(collection.createdAt)}</span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
};
