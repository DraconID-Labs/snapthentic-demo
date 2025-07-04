import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  ShieldCheck,
} from "lucide-react";

export function SnapCard({ snap }: { snap: SnapWithAuthor }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2">
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
      <div className="relative -mx-4 h-[500px] w-screen">
        <Image
          fill
          src={snap.photoData}
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
          <span className="text-sm">Verified</span>
          <ShieldCheck className="size-5 text-green-700" />
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
