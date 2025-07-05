"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ContestBanner } from "../_componenets/contest-banner";
import { Button } from "~/components/ui/button";
import { Heart, HeartOff, Trophy } from "lucide-react";
import { ResponsiveImage } from "~/components/ui/responsive-image";
import { Loader } from "~/components/ui/loader";
import Link from "next/link";

export default function ContestPage() {
  const params = useParams();
  const contestId = params.id as string;

  const { data: contest, isLoading: contestLoading } =
    api.contests.getById.useQuery({ id: contestId }, { enabled: !!contestId });

  const {
    data: entries,
    isLoading: entriesLoading,
    refetch: refetchEntries,
  } = api.contests.getEntries.useQuery({ contestId }, { enabled: !!contestId });

  const { data: voteStatus, refetch: refetchVoteStatus } =
    api.contests.getVoteStatus.useQuery(
      { snapContestIds: entries?.map((entry) => entry.id) ?? [] },
      { enabled: !!entries?.length },
    );

  const voteMutation = api.contests.vote.useMutation({
    onSuccess: () => {
      void refetchEntries();
      void refetchVoteStatus();
      console.log("Vote added!");
    },
    onError: (error) => {
      console.error("Vote error:", error.message);
    },
  });

  const removeVoteMutation = api.contests.removeVote.useMutation({
    onSuccess: () => {
      void refetchEntries();
      void refetchVoteStatus();
      console.log("Vote removed!");
    },
    onError: (error) => {
      console.error("Remove vote error:", error.message);
    },
  });

  const handleVote = (snapContestId: string) => {
    if (voteStatus?.[snapContestId]) {
      removeVoteMutation.mutate({ snapContestId });
    } else {
      voteMutation.mutate({ snapContestId });
    }
  };

  if (contestLoading || entriesLoading) {
    return <Loader />;
  }

  if (!contest) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Contest not found
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between">
        <Link href="/contests" className="text-blue-600 hover:underline">
          ← Back to Contests
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href="/profile/contest-entries">
            <Trophy className="mr-2 size-4" />
            My Entries
          </Link>
        </Button>
      </div>

      {/* @ts-expect-error - TODO: fix ContestWithSnapContests type */}
      <ContestBanner contest={contest} />

      <div className="mt-6 w-full max-w-4xl">
        <h2 className="mb-4 text-xl font-bold">Contest Entries</h2>

        {entries?.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No entries yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries?.map((entry) => (
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

                {/* Entry info overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <h3 className="font-semibold">{entry.snap.title}</h3>
                    <p className="text-sm opacity-90">
                      {entry.snap.description}
                    </p>
                    <p className="text-xs opacity-75">
                      by @{entry.snap.author.displayName}
                    </p>
                  </div>
                </div>

                {/* Vote button */}
                <div className="absolute right-2 top-2 flex items-center gap-2">
                  <span className="rounded bg-black/50 px-2 py-1 text-sm text-white">
                    {entry.votes.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(entry.id)}
                    disabled={
                      voteMutation.isPending || removeVoteMutation.isPending
                    }
                  >
                    {voteStatus?.[entry.id] ? (
                      <HeartOff size={16} />
                    ) : (
                      <Heart size={16} />
                    )}
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
