"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { savePost, unsavePost } from "@/actions/save";
import { Bookmark } from "lucide-react";

interface ToggleSaveButtonProps {
  postId: string;
  initialIsSaved: boolean;
}

export const ToggleSaveButton = ({ postId, initialIsSaved }: ToggleSaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const optimisticState = !isSaved;
    setIsSaved(optimisticState);
    const toastId = toast.loading(optimisticState ? "Saving..." : "Removing...");

    startTransition(async () => {
      const action = isSaved ? unsavePost : savePost;
      const response = await action(postId);

      if (response.success) {
        toast.success(response.message, { id: toastId });
      } else {
        // revert on error
        setIsSaved(isSaved);
        toast.error(response.error?.message || "Unexpected error", { id: toastId });
      }
    });
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.95 }}
      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      disabled={isPending}
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      {isSaved ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-[#5865F2]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
        </svg>
      ) : (
        <Bookmark className="w-5 h-5 text-gray-500" />
      )}
    </motion.button>
  );
};
