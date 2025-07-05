"use client";

import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trophy, Vote } from "lucide-react";
import { ResponsiveImage } from "~/components/ui/responsive-image";
import Link from "next/link";

export default function ContestEntriesPage() {
  const { data: entries, isLoading } = api.contests.getMyEntries.useQuery({});

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!entries?.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Trophy className="mb-4 size-16 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold">No Contest Entries</h2>
        <p className="mb-4 text-gray-600">You haven&apos;t entered any contests yet.</p>
        <Link href="/contests" className="text-blue-600 hover:underline">
          Browse active contests
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">My Contest Entries</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{entry.contest.title}</CardTitle>
                  <Badge variant={entry.contest.active ? "default" : "secondary"}>
                    {entry.contest.active ? "Active" : "Ended"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="relative">
                  {/* Simple image display instead of full SnapCard */}
                  <ResponsiveImage
                    src={entry.snap.photoUrl}
                    alt={entry.snap.title ?? "Contest entry"}
                    maxHeight={300}
                    minHeight={200}
                    objectFit="cover"
                    className="w-full"
                  />
                  
                  {/* Vote count overlay */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-white">
                    <Vote size={14} />
                    <span className="text-sm">{entry.voteCount}</span>
                  </div>
                </div>
                
                <div className="space-y-2 p-4">
                  <div className="text-sm">
                    <p className="font-medium">{entry.snap.title}</p>
                    <p className="text-gray-600">{entry.snap.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contest Prize:</span>
                    <span className="font-semibold text-green-600">
                      {entry.contest.prize ? `$${Number(entry.contest.prize).toFixed(2)}` : "TBD"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your Votes:</span>
                    <span className="font-semibold text-blue-600">
                      {entry.voteCount}
                    </span>
                  </div>
                  
                  <Link
                    href={`/contests/${entry.contest.id}`}
                    className="block w-full rounded bg-blue-600 py-2 text-center text-white transition-colors hover:bg-blue-700"
                  >
                    View Contest
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 