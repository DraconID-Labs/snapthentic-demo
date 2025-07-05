"use client";

import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Check,
  ExternalLink,
  HeartIcon,
  MessageCircleIcon,
  MoreVertical,
  ShareIcon,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
import Link from "next/link";
import LazyImage from "~/components/ui/lazy-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SnapDownload } from "./snap-download";
import { Code } from "~/components/ui/code";

export function SnapCard({
  snap,
  onHeaderClick,
  onBodyClick,
}: {
  snap: SnapWithAuthor;
  onHeaderClick?: () => void;
  onBodyClick?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div className="flex w-full items-center gap-2" onClick={onHeaderClick}>
          <Avatar className="size-10">
            <AvatarImage src={snap.author.avatarUrl ?? undefined} />
            <AvatarFallback>
              {snap.author?.displayName?.slice(0, 2) ?? "Unknown"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 text-xs">
            <h1 className="font-bold">@{snap.author.displayName}</h1>
            <p className="text-gray-500">{snap.author.bio ?? "No bio"}</p>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="relative -mx-4 h-[500px] w-screen cursor-pointer"
        onClick={onBodyClick}
      >
        <LazyImage
          fill
          src={snap.photoUrl}
          alt={snap.title ?? ""}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex w-full items-center gap-2">
          <Button variant="outline" className="max-w-fit px-2">
            <HeartIcon className="size-4 fill-red-500 stroke-red-400" />
            <span className="text-sm">{Math.floor(Math.random() * 100)}</span>
          </Button>
          <Button variant="outline" className="max-w-fit px-2">
            <MessageCircleIcon className="size-4" />
            <span className="text-sm">{Math.floor(Math.random() * 100)}</span>
          </Button>
          <Button variant="outline" className="max-w-fit px-2">
            <ShareIcon className="size-4" />
            <span className="text-sm">{Math.floor(Math.random() * 100)}</span>
          </Button>
        </div>

        <span className="flex items-center gap-1">
          <Drawer>
            <DrawerTrigger className="flex items-center justify-center gap-1">
              <span className="text-sm">Verified</span>
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
      <div className="flex w-full items-center gap-2 pt-2">
        <span className="text-xs font-bold">
          {snap.author.nickname ?? snap.author.displayName}:
        </span>
        <span className="text-xs text-gray-500">{snap.description}</span>
      </div>
      <div className="flex w-full items-center">
        <span className="text-xs text-gray-500">
          {snap.createdAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
