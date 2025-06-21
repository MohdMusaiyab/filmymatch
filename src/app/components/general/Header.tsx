import Link from 'next/link';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 p-3">
      <div className="flex justify-end items-center space-x-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 rounded-full py-2 px-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />  
        <Link href="/dashboard/create-post">
          <button className="bg-blue-300 text-black font-medium rounded-full p-2 px-6 hover:bg-blue-400">
            + Create Snippet
          </button>
        </Link>
      </div>
    </header>
  );
};
