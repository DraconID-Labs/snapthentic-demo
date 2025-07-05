"use client";

import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Trophy, Vote } from "lucide-react";
import { ResponsiveImage } from "~/components/ui/responsive-image";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Loader } from "~/components/ui/loader";

export default function ContestEntriesPage() {
  const { data: entries, isLoading } = api.contests.getMyEntries.useQuery({});

  if (isLoading) {
    return <Loader />;
  }

  if (!entries?.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Trophy className="mb-4 size-16 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold">No Contest Entries</h2>
        <p className="mb-4 text-gray-600">
          You haven&apos;t entered any contests yet.
        </p>
        <Link href="/contests" className="text-blue-600 hover:underline">
          Browse active contests
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Your entries</h1>
        <div /> {/* Spacer for centering */}
      </div>

      <div className="w-full max-w-4xl">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No entries yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative overflow-hidden rounded-lg bg-white shadow-md"
              >
                <ResponsiveImage
                  src={entry.snap.photoUrl}
                  alt={entry.snap.title ?? "Contest entry"}
                  maxHeight={400}
                  minHeight={250}
                  objectFit="cover"
                  className="w-full"
                />

                {/* Contest status badge */}
                <div className="absolute left-2 top-2">
                  <Badge
                    variant={entry.contest.active ? "default" : "secondary"}
                  >
                    {entry.contest.active ? "Active" : "Ended"}
                  </Badge>
                </div>

                {/* Vote count */}
                <div className="absolute right-2 top-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-sm text-white">
                    <Vote size={14} />
                    {entry.voteCount}
                  </span>
                </div>

                {/* Entry info overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <h3 className="font-semibold">{entry.snap.title}</h3>
                    <p className="text-sm opacity-90">
                      {entry.snap.description}
                    </p>
                    <div className="mt-2 flex flex-col items-start justify-between text-xs opacity-75">
                      <span className="font-semibold">
                        {entry.contest.title}
                      </span>
                      {entry.contest.prize && (
                        <span>
                          {Number(entry.contest.prize).toFixed(2)} WLD
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* View contest button */}
                <div className="absolute bottom-2 right-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <Link href={`/contests/${entry.contest.id}`}>
                      View Contest
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
