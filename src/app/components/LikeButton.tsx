"use client";

import { useEffect, useState } from "react";
import { toggleLike, getLikeCount, hasUserLikedPost } from "@/actions/like";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LikeButtonProps {
  postId: string;
  className?: string;
}

const LikeButton = ({ postId, className = "" }: LikeButtonProps) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLikeState = async () => {
    setLoading(true);
    const [countRes, likedRes] = await Promise.all([
      getLikeCount(postId),
      hasUserLikedPost(postId),
    ]);
    if (countRes.success) setCount(countRes.count ?? 0);
    if (likedRes.success) setLiked(likedRes.liked);
    setLoading(false);
  };

  const handleToggleLike = async () => {
    if (!session?.user) return toast.error("Login required to like a post.");
    const res = await toggleLike(postId);
    if (res.success) {
      setLiked(res.liked ?? false);
      setCount((prev) => (res.liked ? prev + 1 : prev - 1));
    } else {
      toast.error(res.message || "Failed to toggle like");
    }
  };

  useEffect(() => {
    fetchLikeState();
  }, [postId]);

  return (
    <motion.button
      onClick={handleToggleLike}
      className={`flex items-center gap-2 text-sm text-zinc-400 hover:text-pink-500 transition ${className}`}
      whileTap={{ scale: 0.9 }}
      disabled={loading}
    >
      {liked ? (
        <Heart size={20} className="text-pink-500" fill="currentColor" />
      ) : (
        <Heart size={20} />
      )}
      <span>{count}</span>
    </motion.button>
  );
};

export default LikeButton;
