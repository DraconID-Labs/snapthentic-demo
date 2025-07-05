"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { cn } from "~/utils/cn";
import { Button } from "./button";

interface LikeButtonProps {
  snapId: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LikeButton({
  snapId,
  initialLikeCount = 0,
  initialIsLiked = false,
  className,
  size = "md",
}: LikeButtonProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();

  // Get current like status
  const { data: userLike } = api.likes.getUserLike.useQuery(
    { snapId },
    {
      enabled: !!session,
      initialData: { liked: initialIsLiked, likedAt: undefined },
    },
  );

  // Get like count
  const { data: likeCount } = api.likes.getCount.useQuery(
    { snapId },
    {
      initialData: initialLikeCount,
    },
  );

  // Toggle like mutation
  const { mutate: toggleLike, isPending } = api.likes.toggle.useMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      await utils.likes.getUserLike.cancel({ snapId });
      await utils.likes.getCount.cancel({ snapId });

      // Snapshot the previous value
      const previousUserLike = utils.likes.getUserLike.getData({ snapId });
      const previousCount = utils.likes.getCount.getData({ snapId });

      // Optimistically update
      utils.likes.getUserLike.setData({ snapId }, (old) => ({
        liked: !old?.liked,
        likedAt: !old?.liked ? new Date() : undefined,
      }));

      utils.likes.getCount.setData(
        { snapId },
        (old) => (old ?? 0) + (previousUserLike?.liked ? -1 : 1),
      );

      return { previousUserLike, previousCount };
    },
    onError: (err, variables, context) => {
      // Revert optimistic updates on error
      if (context?.previousUserLike) {
        utils.likes.getUserLike.setData({ snapId }, context.previousUserLike);
      }
      if (context?.previousCount !== undefined) {
        utils.likes.getCount.setData({ snapId }, context.previousCount);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void utils.likes.getUserLike.invalidate({ snapId });
      void utils.likes.getCount.invalidate({ snapId });
    },
  });

  const handleClick = () => {
    if (!session) {
      // Redirect to login or show login modal
      return;
    }
    toggleLike({ snapId });
  };

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 rounded-full transition-colors",
          userLike?.liked
            ? "text-red-500 hover:text-red-600"
            : "text-gray-500 hover:text-red-500",
          sizeClasses[size],
          className,
        )}
      >
        <Heart
          size={iconSizes[size]}
          className={cn(
            "transition-colors",
            userLike?.liked ? "fill-current" : "fill-none",
          )}
        />
        {likeCount !== undefined && likeCount > 0 && (
          <span className="text-xs font-medium">{likeCount}</span>
        )}
      </Button>
    </div>
  );
}
