"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { savePost, unsavePost } from "@/actions/save"; // adjust to correct path
import { Bookmark, BookmarkCheck } from "lucide-react";

interface ToggleSaveButtonProps {
  postId: string;
  initialIsSaved: boolean;
}

export const ToggleSaveButton = ({ postId, initialIsSaved }: ToggleSaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const optimisticState = !isSaved;
    setIsSaved(optimisticState); // ⏱️ update UI immediately
    const toastId = toast.loading(optimisticState ? "Saving..." : "Removing...");
  
    startTransition(async () => {
      const action = isSaved ? unsavePost : savePost;
      const response = await action(postId);
  
      if (response.success) {
        toast.success(response.message, { id: toastId });
      } else {
        // Revert on error
        setIsSaved(isSaved); 
        toast.error(response.error?.message || "Unexpected error", { id: toastId });
      }
    });
  };
  

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-full transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isPending}
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      {isSaved ? (
        <BookmarkCheck className="w-5 h-5 text-primary" />
      ) : (
        <Bookmark className="w-5 h-5 text-muted-foreground" />
      )}
    </motion.button>
  );
};
