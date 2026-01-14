"use client";

import { useState } from "react";
import { toggleLike } from "@/actions/like";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean; // Received from Step 1 (Prisma)
  initialCount: number; // Received from Step 1 (Prisma)
  className?: string;
}

const LikeButton = ({ 
  postId, 
  initialLiked, 
  initialCount, 
  className = "" 
}: LikeButtonProps) => {
  // 1. Initialize state directly from props. 
  // No more useEffect fetching on mount!
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    // Prevent navigation if the button is inside a Link/Card
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    // 2. Optimistic Update: Update UI immediately
    const previousLiked = liked;
    const previousCount = count;

    setLiked(!previousLiked);
    setCount((prev) => (previousLiked ? prev - 1 : prev + 1));
    setIsPending(true);

    try {
      const res = await toggleLike(postId);

      if (!res.success) {
        // 3. Revert if the server action fails
        setLiked(previousLiked);
        setCount(previousCount);
        
        if (res.code === "UNAUTHORIZED") {
          toast.error("Please login to like posts");
        } else {
          toast.error(res.message || "Failed to like post");
        }
      }
    } catch (error) {
      console.log(error);
      // Revert on network error
      setLiked(previousLiked);
      setCount(previousCount);
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggleLike}
      className={`flex items-center gap-1.5 transition-colors ${
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
      } ${className}`}
      whileTap={{ scale: 0.85 }}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart 
        size={18} 
        fill={liked ? "currentColor" : "none"} 
        strokeWidth={liked ? 0 : 2}
        className={isPending ? "opacity-70" : "opacity-100"}
      />
      <span className="text-xs font-medium">{count}</span>
    </motion.button>
  );
};

export default LikeButton;