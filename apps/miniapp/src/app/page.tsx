"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function Page() {
  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getMyProfile.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile || isError) {
    return <div>No profile found</div>;
  }

  return (
    <div>
      <h1>Hello {profile.displayName}</h1>
      <div>
        <Link href="/snaps">
          <Button>Snaps</Button>
        </Link>
        <Link href="/profile">
          <Button>Profile</Button>
        </Link>
      </div>
    </div>
  );
}
