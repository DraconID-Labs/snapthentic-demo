"use client";

import { UserPlus } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import LazyImage from "~/components/ui/lazy-image";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";

export default function Page() {
  const router = useRouter();
  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getMyProfile.useQuery();

  const {
    data: snapsRaw,
    isLoading: snapsLoading,
    isError: snapsError,
  } = api.snaps.getMySnaps.useQuery();

  if (isLoading || snapsLoading) return <Loader />;
  if (isError || snapsError) return <div>Error...</div>;

  if (!profile) {
    router.push("/profile/verify");
  }

  const snaps = snapsRaw ?? [];

  // const placeholderSnaps = Array.from({ length: 20 }, (_, index) => ({
  //   id: index,
  //   title: `Snap ${index}`,
  //   description: `Description ${index}`,
  //   imageUrl: `https://picsum.photos/200/300?random=${index}`,
  // }));

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
          <h2 className="font-bold">@{profile?.displayName}</h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span>{snaps.length}</span>
              <span className="text-xs">snaps</span>
            </div>
            <div className="flex flex-col text-left">
              <span>{Math.floor(Math.random() * 1000)}</span>
              <span className="text-xs">followers</span>
            </div>
            <div className="flex flex-col text-left">
              <span>{Math.floor(Math.random() * 1000)}</span>
              <span className="text-xs">following</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex w-full items-center justify-evenly gap-1">
        <Button asChild variant="outline" className="w-full">
          <Link href="/profile/edit">Edit profile</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => signOut()}>
          Sign Out
        </Button>
        <Button variant="outline" className="w-full">
          Share profile
        </Button>
        <Button variant="outline">
          <UserPlus />
        </Button>
      </div>
      <div className="grid w-full grid-cols-3 gap-1">
        {snaps.map((snap) => (
          <Link href={`/snaps/${snap.id}`} key={snap.id}>
            <div className="relative flex h-[200px] flex-col gap-2">
              <LazyImage
                fill
                src={snap.photoUrl}
                alt={snap.title ?? ""}
                className="object-cover"
              />
            </div>
          </Link>
        ))}
        {/* {placeholderSnaps.map((snap) => (
          <div key={snap.id} className="flex flex-col gap-2">
            <Image
              src={snap.imageUrl}
              alt={snap.title}
              width={150}
              height={250}
            />
          </div>
        ))} */}
      </div>
    </div>
  );
}
