import { Collection } from '@/types';

interface CollectionsProps {
  collections: Collection[];
}

export const Collections = ({ collections }: CollectionsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {collections.map((collection) => (
        <div 
          key={collection.id} 
          className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{collection.icon}</span>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded">{collection.count}</span>
          </div>
          <h3 className="font-bold text-lg">#{collection.tag}</h3>
        </div>
      ))}
    </div>
  );
};