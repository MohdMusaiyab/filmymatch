"use client";

import React, { useEffect, useState } from "react";
import { toggleFollow, isFollowing } from "@/actions/follow";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
    userId: string; // the user to follow/unfollow
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
    const { data: session } = useSession();
    const [isFollowingUser, setIsFollowingUser] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchFollowStatus = async () => {
        setLoading(true);
        const res = await isFollowing(userId);
        if (res.success) {
            setIsFollowingUser(res.following ?? null);
        } else {
            toast.error(res.message || "Failed to check follow status");
        }
        setLoading(false);
    };

    const handleToggleFollow = async () => {
        if (!session?.user?.id) {
            return toast.error("Please log in to follow users");
        }

        setLoading(true);
        const res = await toggleFollow(userId);
        if (res.success) {
            setIsFollowingUser(res.following ?? null);
            toast.success(res.message);
        } else {
            toast.error(res.message || "Action failed");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (session?.user?.id && session.user.id !== userId) {
            fetchFollowStatus();
        }
    }, [session, userId]);

    if (!session?.user?.id || session.user.id === userId) return null;

    return (
        <button
            onClick={handleToggleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border focus:outline-none
        ${isFollowingUser
                    ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                    : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"}
      `}
        >
            {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
            ) : isFollowingUser ? (
                "Unfollow"
            ) : (
                "Follow"
            )}
        </button>
    );
};

export default FollowButton;
