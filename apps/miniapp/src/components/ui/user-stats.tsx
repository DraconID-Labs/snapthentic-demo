"use client";

import { api } from "~/trpc/react";
import { cn } from "~/utils/cn";

interface UserStatsProps {
  userId: string;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
  className?: string;
}

export function UserStats({
  userId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
  className,
}: UserStatsProps) {
  // Get current counts
  const { data: counts } = api.follows.getCounts.useQuery(
    { userId },
    {
      initialData: {
        followers: initialFollowersCount,
        following: initialFollowingCount,
      },
    },
  );

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">
          {formatCount(counts?.followers ?? 0)}
        </span>
        <span className="text-sm text-gray-500">Followers</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">
          {formatCount(counts?.following ?? 0)}
        </span>
        <span className="text-sm text-gray-500">Following</span>
      </div>
    </div>
  );
}

interface UserStatsInlineProps {
  userId: string;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
  className?: string;
}

export function UserStatsInline({
  userId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
  className,
}: UserStatsInlineProps) {
  // Get current counts
  const { data: counts } = api.follows.getCounts.useQuery(
    { userId },
    {
      initialData: {
        followers: initialFollowersCount,
        following: initialFollowingCount,
      },
    },
  );

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <span className="text-gray-600">
        <span className="font-medium text-gray-900">
          {formatCount(counts?.followers ?? 0)}
        </span>{" "}
        followers
      </span>
      <span className="text-gray-600">
        <span className="font-medium text-gray-900">
          {formatCount(counts?.following ?? 0)}
        </span>{" "}
        following
      </span>
    </div>
  );
}
