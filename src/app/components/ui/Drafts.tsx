import Link from "next/link";
import { Draft } from "@/types";

interface DraftsProps {
  drafts: Draft[];
}

export const Drafts = ({ drafts }: DraftsProps) => {
  if (!drafts || drafts.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-400">
        You don’t have any drafts yet.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Drafts & Unpublished Notes</h2>
      <div className="bg-gray-900 rounded-xl divide-y divide-gray-800">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="flex items-center p-4 hover:bg-gray-800 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-300 bg-opacity-20 rounded-lg flex items-center justify-center mr-4 text-lg">
              {draft.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{draft.title}</h3>
              <p className="text-sm text-gray-400">
                {draft.timeAgo} • {draft.status}
              </p>
            </div>
            <Link
              href={`/dashboard/edit/${draft.id}`}
              className="ml-4 px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Continue →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
