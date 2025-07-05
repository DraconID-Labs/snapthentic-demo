"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader } from "~/components/ui/loader";
import { api } from "~/trpc/react";
import { SnapCard } from "../snaps/_components/snap-card";

export default function FeedPage() {
  const session = useSession();
  const router = useRouter();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.snaps.getFeed.useInfiniteQuery(
    {
      limit: 1,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "100px", // Start loading 100px before reaching the element
      },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single array
  const allSnaps = data?.pages?.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="text-lg text-red-500">Error loading feed</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: it's fine */}
      <h1 className="text-2xl font-bold" onClick={() => signOut()}>
        Feed
      </h1>

      {allSnaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No snaps yet!</p>
        </div>
      ) : (
        <>
          {allSnaps.map((snap) => (
            <SnapCard
              key={snap.id}
              snap={snap}
              isOwner={session.data?.user.id === snap.author.userId}
              onBodyClick={() => {
                router.push(`/snaps/${snap.id}`);
              }}
              onHeaderClick={() => {
                router.push(`/profile/${snap.author.userId}`);
              }}
            />
          ))}

          {/* Infinite scroll trigger */}
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center py-8"
          >
            {isFetchingNextPage ? (
              <Loader className="max-h-fit w-full" />
            ) : hasNextPage ? (
              <div className="text-gray-400">Scroll to load more</div>
            ) : (
              <div className="text-gray-400">No more snaps</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
