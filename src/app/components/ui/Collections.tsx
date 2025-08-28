import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/types";

interface CollectionsProps {
  collections: Collection[];
  showCoverImage?: boolean;
}

export const Collections = ({ collections, showCoverImage = true }: CollectionsProps) => {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        You haven’t created any collections yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/explore/collection/${collection.id}`}
          className="bg-gray-900 rounded-xl hover:bg-gray-800 p-4 transition"
        >
          {showCoverImage && (
            <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden bg-gray-700">
              {collection.coverImage ? (
                <Image
                  src={collection.coverImage}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Cover
                </div>
              )}
            </div>
          )}

          <h3 className="font-semibold text-lg truncate">{collection.name}</h3>
          <span className="text-xs text-gray-400 capitalize">
            {collection.visibility.toLowerCase()}
          </span>
        </Link>
      ))}
    </div>
  );
};
