"use client";

import { Power, UserPlus, Trophy } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { AspectRatioImage } from "~/components/ui/responsive-image";
import { api } from "~/trpc/react";
import { CreateProfile } from "../_components/create-profile";

export default function Page() {
  const session = useSession();

  const {
    data: snapsRaw,
    isLoading: snapsLoading,
    isError: snapsError,
  } = api.snaps.getMySnaps.useQuery();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = api.userProfile.me.useQuery();

  if (session.status === "loading" || profileLoading || snapsLoading) {
    return <Loader />;
  }

  if (snapsError || profileError) {
    return <div>Error loading snaps...</div>;
  }

  if (!profile) {
    return <CreateProfile />;
  }

  const snaps = snapsRaw ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="w-full text-left text-2xl font-bold">Profile</h1>
        <Button variant="ghost" className="p-2" onClick={() => signOut()}>
          <Power className="size-6" />
        </Button>
      </div>

      {/* Avatar header */}
      <div className="flex w-full items-center justify-between gap-4">
        <Avatar>
          <AvatarImage src={profile?.avatarUrl ?? undefined} />
          <AvatarFallback>{profile?.displayName?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">@{profile?.displayName}</h2>
            {profile?.bio && (
              <p className="text-xs text-gray-600">{profile?.bio}</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-left leading-none">
              <span>{snaps.length}</span>
              <span className="text-xs">snaps</span>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span>{profile?.followersCount ?? 0}</span>
              <span className="text-xs">followers</span>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span>{profile?.followingCount ?? 0}</span>
              <span className="text-xs">following</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex w-full items-center justify-evenly gap-1">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/profile/edit">Edit profile</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/profile/contest-entries">
            <Trophy className="size-4" />
            My Contests
          </Link>
        </Button>
        <Button variant="outline">
          <UserPlus />
        </Button>
      </div>
      <div className="grid w-full grid-cols-3 gap-1">
        {snaps.map((snap) => (
          <Link href={`/snaps/${snap.id}`} key={snap.id}>
            <AspectRatioImage
              src={snap.photoUrl}
              alt={snap.title ?? "Snap"}
              aspectRatio="3/4"
              objectFit="cover"
              className="transition-opacity hover:opacity-80"
            />
          </Link>
        ))}
      </div>

      {snaps.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-8">
          <p className="text-gray-500">No snaps yet</p>
          <Button asChild variant="outline">
            <Link href="/snaps/take">Take your first snap</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
