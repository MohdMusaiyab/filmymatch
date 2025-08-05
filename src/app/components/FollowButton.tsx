"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toggleFollow, isFollowing } from "@/actions/follow";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface FollowButtonProps {
    userId: string; // the user to follow/unfollow
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
    const { data: session } = useSession();
    const [isFollowingUser, setIsFollowingUser] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchFollowStatus = useCallback(async () => {
        setLoading(true);
        const res = await isFollowing(userId);
        if (res.success) {
            setIsFollowingUser(res.following ?? null);
        } else {
            toast.error(res.message || "Failed to check follow status");
        }
        setLoading(false);
    }, [userId]);

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
    }, [session, userId, fetchFollowStatus]);

    if (!session?.user?.id || session.user.id === userId) return null;

    return (
        <button
            onClick={handleToggleFollow}
            className={`w-24 px-4 py-1 flex items-center justify-center rounded-lg text-sm font-medium transition duration-200 border focus:outline-none
        ${isFollowingUser
                    ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                    : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"}
      `}
        >
            {isFollowingUser ? (
                loading? <Loader size={18}/> : "Unfollow"
            ) : (
                loading? <Loader size={18}/> : "Follow"
            )}
        </button>
    );
};

export default FollowButton;
