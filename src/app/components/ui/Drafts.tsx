import Link from "next/link";
import { Draft } from "@/types";
import { FileText, Calendar } from "lucide-react";

interface DraftsProps {
  drafts: Draft[];
}

export const Drafts = ({ drafts }: DraftsProps) => {
  if (!drafts || drafts.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-400 border border-gray-800">
        You don’t have any drafts yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold truncate text-gray-800">
                {draft.title || "Untitled Draft"}
              </h4>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Draft
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 truncate">
              {draft.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              Saved on {new Date(draft.createdAt).toLocaleDateString()}
              <Link
                href={`/dashboard/my-posts/${draft.id}`}
                className="text-primary hover:text-primary/80"
              >
                Continue
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
