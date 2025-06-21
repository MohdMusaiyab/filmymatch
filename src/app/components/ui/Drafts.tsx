import { Draft } from '@/types';

interface DraftsProps {
  drafts: Draft[];
}

export const Drafts = ({ drafts }: DraftsProps) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Drafts & Unpublished Notes</h2>
      <div className="bg-gray-900 rounded-xl p-4">
        {drafts.map((draft) => (
          <div 
            key={draft.id}
            className={`flex items-center ${draft.id !== drafts[drafts.length - 1].id ? 'border-b border-gray-800 pb-4 mb-4' : ''}`}
          >
            <div className="w-10 h-10 bg-blue-300 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <span>{draft.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{draft.title}</h3>
              <p className="text-sm text-gray-400">{draft.timeAgo} • {draft.status}</p>
            </div>
            <button className="text-blue-300 hover:text-blue-400">Continue</button>
          </div>
        ))}
      </div>
    </div>
  );
};