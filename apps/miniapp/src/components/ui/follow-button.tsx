"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { cn } from "~/utils/cn";
import { Button } from "./button";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  className,
  size = "md",
  variant = "default",
}: FollowButtonProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();

  // Don't show follow button for current user
  if (session?.user?.id === userId) {
    return null;
  }

  // Get current follow status
  const { data: followStatus } = api.follows.isFollowing.useQuery(
    { userId },
    {
      enabled: !!session,
      initialData: { following: initialIsFollowing, followedAt: undefined },
    },
  );

  // Toggle follow mutation
  const { mutate: toggleFollow, isPending } = api.follows.toggle.useMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      await utils.follows.isFollowing.cancel({ userId });
      await utils.follows.getCounts.cancel({ userId });

      // Snapshot the previous value
      const previousFollowStatus = utils.follows.isFollowing.getData({
        userId,
      });
      const previousCounts = utils.follows.getCounts.getData({ userId });

      // Optimistically update follow status
      utils.follows.isFollowing.setData({ userId }, (old) => ({
        following: !old?.following,
        followedAt: !old?.following ? new Date() : undefined,
      }));

      // Optimistically update follower count
      utils.follows.getCounts.setData({ userId }, (old) => ({
        followers:
          (old?.followers ?? 0) + (previousFollowStatus?.following ? -1 : 1),
        following: old?.following ?? 0,
      }));

      return { previousFollowStatus, previousCounts };
    },
    onError: (err, variables, context) => {
      // Revert optimistic updates on error
      if (context?.previousFollowStatus) {
        utils.follows.isFollowing.setData(
          { userId },
          context.previousFollowStatus,
        );
      }
      if (context?.previousCounts) {
        utils.follows.getCounts.setData({ userId }, context.previousCounts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void utils.follows.isFollowing.invalidate({ userId });
      void utils.follows.getCounts.invalidate({ userId });
    },
  });

  const handleClick = () => {
    if (!session) {
      // Redirect to login or show login modal
      return;
    }
    toggleFollow({ userId });
  };

  const isFollowing = followStatus?.following;

  // Map size to Button component sizes
  const buttonSize = size === "md" ? "default" : size;

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing ? "outline" : variant}
      size={buttonSize}
      className={cn(
        "flex items-center gap-2 transition-colors",
        isFollowing
          ? "border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600"
          : "bg-blue-600 text-white hover:bg-blue-700",
        className,
      )}
    >
      {isFollowing ? (
        <>
          <UserMinus size={16} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={16} />
          <span>Follow</span>
        </>
      )}
    </Button>
  );
}
