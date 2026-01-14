import { Suspense } from "react";
import { getExplorePosts } from "@/lib/queries/posts";
import ExploreClientWrapper from "./ExploreClientWrapper";
import { Loader2 } from "lucide-react";
// Change this import to your server-side auth helper
import { getSession } from "@/lib/auth"; 

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string | string[];
    tags?: string | string[];
    page?: string;
    visibility?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const categories = Array.isArray(params.category) ? params.category : params.category ? [params.category] : [];
  const tags = Array.isArray(params.tags) ? params.tags : params.tags ? [params.tags] : [];
  const search = params.search || "";

  // 1. Get the session using the SERVER-SIDE helper
  const session = await getSession();

  // 2. Fetch data
  const result = await getExplorePosts({
    page: currentPage,
    search: search,
    categories: categories,
    tags: tags,
    limit: 12,
  });

  const posts = result.success ? result.data.posts : [];
  const pagination = result.data?.pagination;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#5865F2] to-[#94BBFF] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explore Snippets
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover amazing code snippets, tutorials, and resources
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#5865F2]" /></div>}>
        <ExploreClientWrapper 
          initialPosts={posts} 
          pagination={pagination}
          currentFilters={{
            search,
            categories,
            tags
          }}
          // 3. Match your session shape (session.id based on your previous snippet)
          currentUserId={session?.id} 
        />
      </Suspense>
    </main>
  );
}