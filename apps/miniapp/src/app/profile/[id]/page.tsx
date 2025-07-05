"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Loader } from "~/components/ui/loader";
import { AspectRatioImage } from "~/components/ui/responsive-image";
import { FollowButton } from "~/components/ui/follow-button";
import { useSessionWithProfile } from "~/hooks/use-session-with-profile";
import { api } from "~/trpc/react";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const session = useSessionWithProfile();

  const isOwner =
    id ===
    (session.status === "authenticated" ? session.profile?.id : undefined);

  if (isOwner) {
    return router.push("/profile/me");
  }

  if (!id) {
    throw new Error("No ID");
  }

  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getByUserId.useQuery({ userId: id as string });

  const {
    data: snapsRaw,
    isLoading: snapsLoading,
    isError: snapsError,
  } = api.snaps.getByAuthorId.useQuery({ authorId: id as string });

  if (isLoading || snapsLoading) return <Loader />;
  if (isError || snapsError) return <div>Error...</div>;

  if (!profile) {
    router.push("/profile/verify");
  }

  const snaps = snapsRaw ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center gap-4">
      <h1 className="w-full text-left text-2xl font-bold">Profile</h1>
      {/* Avatar header */}
      <div className="flex w-full items-center justify-between gap-4">
        <Avatar>
          <AvatarImage src={profile?.avatarUrl ?? undefined} />
          <AvatarFallback>{profile?.displayName?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">@{profile?.displayName}</h2>
            <FollowButton
              userId={id as string}
              size="sm"
              className="ml-auto"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span>{snaps.length}</span>
              <span className="text-xs">snaps</span>
            </div>
            <div className="flex flex-col text-left">
              <span>{profile?.followersCount ?? 0}</span>
              <span className="text-xs">followers</span>
            </div>
            <div className="flex flex-col text-left">
              <span>{profile?.followingCount ?? 0}</span>
              <span className="text-xs">following</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bio section */}
      {profile?.bio && (
        <div className="w-full">
          <p className="text-sm text-gray-600">{profile.bio}</p>
        </div>
      )}
      
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
        <div className="flex w-full items-center justify-center py-8">
          <p className="text-gray-500">No snaps yet</p>
        </div>
      )}
    </div>
  );
}
