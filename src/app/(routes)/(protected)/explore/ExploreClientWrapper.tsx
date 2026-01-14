"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Loader2, Hash, Filter, RotateCcw } from "lucide-react";
import { Post as PostType } from "@/types/Post";
import { CategoryEnum, TagsEnum } from "@/schemas/common"; 
import { Snippet } from "@/app/components/ui/Snippet";
import Button from "@/app/components/Button";

interface ExploreClientWrapperProps {
  initialPosts: PostType[];
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
  currentFilters: {
    search: string;
    categories: string[];
    tags: string[];
  };
  currentUserId?: string;
}

export default function ExploreClientWrapper({
  initialPosts,
  pagination,
  currentFilters,
  currentUserId,
}: ExploreClientWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [showCategories, setShowCategories] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Unified transition-aware update function
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    if (!updates.page) params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    // Immediate feedback for the user
    startTransition(() => {
      router.push(pathname);
    });
  };

  const toggleCategory = (cat: string) => {
    const next = currentFilters.categories.includes(cat)
      ? currentFilters.categories.filter((c) => c !== cat)
      : [...currentFilters.categories, cat];
    updateFilters({ category: next });
  };

  const toggleTag = (tag: string) => {
    const next = currentFilters.tags.includes(tag)
      ? currentFilters.tags.filter((t) => t !== tag)
      : [...currentFilters.tags, tag];
    updateFilters({ tags: next });
  };

  const hasActiveFilters = currentFilters.categories.length > 0 || currentFilters.tags.length > 0 || currentFilters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6 relative">
        {/* The Loader Overlay: Crucial for UX */}
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-2xl transition-all">
            <Loader2 className="w-10 h-10 animate-spin text-[#5865F2] mb-2" />
            <p className="text-sm font-medium text-gray-600">Updating results...</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              defaultValue={currentFilters.search}
              onChange={(e) => updateFilters({ search: e.target.value || null })}
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5865F2]/30 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Button
                variant={currentFilters.categories.length > 0 ? "theme-primary" : "outline"}
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                Categories {currentFilters.categories.length > 0 && `(${currentFilters.categories.length})`}
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </Button>
              
              {showCategories && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowCategories(false)} />
                  <div className="absolute right-0 z-30 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 animate-in fade-in zoom-in duration-150">
                    <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                      {CategoryEnum.options.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm mb-1 transition-all ${
                            currentFilters.categories.includes(cat) 
                              ? 'bg-[#5865F2] text-white shadow-md font-bold' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters} 
                className="text-red-500 border-red-100 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={16} />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tags Quick-Bar (Visible & Styled) */}
      <div className="mb-8 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2]/10 rounded-lg text-[#5865F2] text-xs font-bold uppercase tracking-wider whitespace-nowrap border border-[#5865F2]/20">
            <Hash size={14} /> Popular Tags
          </div>
          <div className="flex items-center gap-2">
            {TagsEnum.options.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                  currentFilters.tags.includes(tag)
                    ? "bg-[#5865F2] border-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20 scale-105"
                    : "bg-white border-gray-200 text-gray-500 hover:border-[#5865F2] hover:text-[#5865F2]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <AnimatePresence mode="popLayout">
          {initialPosts.length > 0 ? (
            initialPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
              >
                <Snippet 
                  post={post} 
                  userId={currentUserId}
                  menuOpen={menuOpen} 
                  toggleMenu={(id) => setMenuOpen(menuOpen === id ? null : id)} 
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
              <Button onClick={handleClearFilters} className="mt-6">Clear everything</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-16">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              disabled={isPending}
              onClick={() => updateFilters({ page: p.toString() })}
              className={`w-12 h-12 rounded-xl border font-bold transition-all flex items-center justify-center ${
                pagination.page === p 
                  ? "bg-[#5865F2] text-white border-[#5865F2] shadow-xl shadow-[#5865F2]/30 -translate-y-1" 
                  : "bg-white text-gray-500 hover:border-[#5865F2] hover:text-[#5865F2] active:scale-90"
              } disabled:opacity-50`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}