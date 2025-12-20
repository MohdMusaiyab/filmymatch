import Link from "next/link";
import { Collection } from "@/types";
import { Ellipsis } from "lucide-react";

interface CollectionsProps {
  collections: Collection[];
  showCoverImage?: boolean; // We’ll set as false for title-only cards
}

export const Collections = ({
  collections,
  showCoverImage = false, // always false for this design
}: CollectionsProps) => {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        You haven’t created any collections yet.
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

  return (
    <div className="grid grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/explore/collection/${collection.id}`}
          className="
            rounded-xl overflow-hidden shadow-sm
            bg-gradient-to-br from-[#6366f1] via-[#818cf8] to-[#6366f1]
            transition-shadow hover:shadow-md
            text-white
            flex flex-col justify-center
            px-6 py-8
            min-h-[140px]
          "
        >
          <h4 className="font-semibold text-white text-lg mb-2">
            #{collection.name}
          </h4>
          <p className="text-white/90 text-sm mb-3">
            {collection.postCount}{" "}
            {collection.postCount === 1 ? "post" : "posts"} · Created{" "}
            {timeAgo(collection.createdAt)}
            {/* {collection.postsCount} posts · Created {collection.createdAgo} */}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 capitalize">
              {collection.visibility.toLowerCase()}
            </span>
            <Ellipsis size={18} color="#fff" />
          </div>
        </Link>
      ))}
    </div>
  );
};
