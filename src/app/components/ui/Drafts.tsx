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
    <div>
      <h2 className="text-xl font-bold mb-4">Drafts & Unpublished Notes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="group bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <FileText size={16} />
                <span className="truncate">Draft</span>
              </div>
              <h3 className="font-semibold text-lg text-white truncate group-hover:text-blue-400 transition">
                {draft.title || "Untitled Draft"}
              </h3>
              <div className="flex items-center text-gray-500 text-xs mt-2 gap-1">
                <Calendar size={14} />
                {new Date(draft.createdAt).toLocaleDateString()}
              </div>
            </div>
            <Link
              href={`/dashboard/my-posts/${draft.id}`}
              className="mt-4 w-full text-center px-3 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Continue →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
