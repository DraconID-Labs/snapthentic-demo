"use client";

import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getMyProfile.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  if (!profile) {
    router.push("/profile/verify");
  }

  const placeholderSnaps = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    title: `Snap ${index}`,
    description: `Description ${index}`,
    imageUrl: `https://picsum.photos/200/300?random=${index}`,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center gap-4">
      {/* Avatar header */}
      <div className="flex w-full items-center justify-between gap-4">
        <Avatar>
          <AvatarImage src={profile?.avatarUrl ?? undefined} />
          <AvatarFallback>{profile?.displayName?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-2">
          <h2 className="font-bold">@{profile?.displayName}</h2>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span>0</span>
              <span className="text-sm">snaps</span>
            </div>
            <div className="flex flex-col text-left">
              <span>0</span>
              <span className="text-sm">followers</span>
            </div>
            <div className="flex flex-col text-left">
              <span>0</span>
              <span className="text-sm">following</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex w-full items-center justify-evenly gap-1">
        <Button asChild variant="outline" className="w-full">
          <Link href="/profile/edit">Edit profile</Link>
        </Button>
        <Button variant="outline" className="w-full">
          Share profile
        </Button>
        <Button variant="outline">
          <UserPlus />
        </Button>
      </div>
      <div className="grid w-full grid-cols-3 gap-1">
        {placeholderSnaps.map((snap) => (
          <div key={snap.id} className="flex flex-col gap-2">
            <Image
              src={snap.imageUrl}
              alt={snap.title}
              width={150}
              height={250}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
