"use client";

import type { SnapWithAuthor } from "@snapthentic/database/schema";
import {
  Check,
  Link as LinkIcon,
  ExternalLink,
  MessageCircleIcon,
  MoreVertical,
  Trophy,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Code } from "~/components/ui/code";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LikeButton } from "~/components/ui/like-button";
import { ResponsiveImage } from "~/components/ui/responsive-image";
import { env } from "~/env";
import { SnapDelete } from "./snap-delete";
import { SnapDownload } from "./snap-download";
import { SnapEdit } from "./snap-edit";
import { useCopyUrl } from "./use-share-on-x";

// Extended type for snap with like and contest information
type SnapWithLikes = SnapWithAuthor & {
  likeCount?: number;
  isLikedByUser?: boolean;
  contestEntry?: {
    id: string;
    contest: {
      id: string;
      title: string;
      active: boolean | null;
      prize: string | null;
    };
    voteCount: number;
  } | null;
};

export function SnapCard({
  snap,
  onHeaderClick,
  onBodyClick,
  isOwner,
}: {
  snap: SnapWithLikes;
  onHeaderClick?: () => void;
  onBodyClick?: () => void;
  isOwner?: boolean;
}) {
  const { handleCopy, isCopied, isError } = useCopyUrl({
    url: `${env.NEXT_PUBLIC_APP_URL}/snaps/${snap.id}`,
  });

  const isContestEntry = !!snap.contestEntry;
  const isActiveContest = snap.contestEntry?.contest.active;

  return (
    <div className="flex w-full flex-col">
      {/* Contest Badge */}
      {isContestEntry && snap.contestEntry && (
        <div className="mb-2 flex items-center justify-between">
          <Link href={`/contests/${snap.contestEntry.contest.id}`}>
            <Badge
              variant={isActiveContest ? "default" : "secondary"}
              className="flex cursor-pointer items-center gap-1 hover:bg-opacity-80"
            >
              <Trophy size={12} />
              {snap.contestEntry.contest.title}
              {isActiveContest && <span className="text-xs">• Live →</span>}
            </Badge>
          </Link>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Vote size={12} />
            <span>{snap.contestEntry.voteCount} votes</span>
          </div>
        </div>
      )}

      <div className="flex w-full items-center justify-between">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className="mb-3 flex w-full items-center gap-2"
          onClick={onHeaderClick}
        >
          <Avatar className="size-10">
            <AvatarImage src={snap.author.avatarUrl ?? undefined} />
            <AvatarFallback>
              {snap.author?.displayName?.slice(0, 2) ?? "Unknown"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 text-xs">
            <h1 className="font-bold">@{snap.author.displayName}</h1>
            <p className="text-2x text-gray-500">
              {snap.author.bio ?? "No bio"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="max-w-fit px-2">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100">
            <DropdownMenuItem>
              <SnapDownload snap={snap} />
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuItem>
                  <SnapEdit snap={snap} />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-300" />
                <DropdownMenuItem>
                  <SnapDelete snap={snap} />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Responsive image that preserves aspect ratio */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={`relative mb-2 cursor-pointer ${isContestEntry ? "rounded-lg border-2 border-dashed border-blue-400 p-1" : ""}`}
        onClick={onBodyClick}
      >
        <ResponsiveImage
          src={snap.photoUrl}
          alt={snap.title ?? "Snap photo"}
          maxHeight={600}
          minHeight={300}
          objectFit="contain"
          className={`w-full ${isContestEntry ? "rounded-md" : ""}`}
          priority={false}
        />

        {/* Contest indicator overlay */}
        {isContestEntry && (
          <div className="absolute right-2 top-2">
            <div className="rounded-full bg-blue-500 p-1 text-white shadow-lg">
              <Trophy size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="mb-1 flex w-full items-center justify-between">
        <div className="flex w-full items-center gap-1">
          <LikeButton
            snapId={snap.id}
            initialLikeCount={snap.likeCount ?? 0}
            initialIsLiked={snap.isLikedByUser ?? false}
            size="sm"
            className="max-w-fit px-1"
          />
          <Button variant="ghost" className="max-w-fit px-1">
            <MessageCircleIcon className="size-4" />
            <span className="text-sm">{Math.floor(Math.random() * 10)}</span>
          </Button>
          <Button
            variant="ghost"
            className={`max-w-fit px-1 ${isCopied ? "text-green-600" : isError ? "text-red-600" : ""}`}
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="size-4" />
            ) : (
              <LinkIcon className="size-4" />
            )}
          </Button>
        </div>

        <span className="flex items-center gap-1">
          <Drawer>
            <DrawerTrigger className="flex items-center justify-center gap-1 text-xs opacity-50">
              Verified
              <Check className="size-5 text-green-700" />
            </DrawerTrigger>
            <DrawerContent className="flex max-h-[100vw] flex-col gap-2 p-4 pb-[150px] text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-bold">Author</span>
                <Code className="border-none">{snap.signerAddress}</Code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold">Signature</span>
                <Code className="border-none">{snap.signature}</Code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold">Hash</span>
                <Code className="border-none">{snap.hash}</Code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="pl-2 font-bold">Transaction</span>
                <Code className="border-none">{snap.txHash}</Code>
              </div>
              <Link
                href={`https://sepolia.etherscan.io/tx/${snap.txHash}`}
                target="_blank"
              >
                <div className="flex items-center justify-end gap-1 pt-5 font-bold">
                  See on explorer <ExternalLink className="size-4" />
                </div>
              </Link>
            </DrawerContent>
          </Drawer>
        </span>
      </div>
      <div className="mb-1 flex w-full items-center gap-2">
        <span className="text-xs font-bold">
          {snap.author.nickname ?? snap.author.displayName}:
        </span>
        <span className="text-xs text-gray-500">{snap.description}</span>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-extralight text-gray-500">
          {snap.createdAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
