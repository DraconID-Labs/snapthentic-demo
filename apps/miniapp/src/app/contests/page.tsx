import { db } from "~/server/database";
import { ContestBanner } from "./_componenets/contest-banner";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Trophy } from "lucide-react";

export default async function Page() {
  const contests = await db.query.contest.findMany({
    with: {
      snapContests: {
        with: {
          snap: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Contests</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/profile/contest-entries">
            <Trophy className="mr-2 size-4" />
            My Entries
          </Link>
        </Button>
      </div>
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {contests.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <p className="text-gray-500">No contests yet!</p>
          </div>
        ) : (
          contests.map((contest) => (
            <Link key={contest.id} href={`/contests/${contest.id}`}>
              <div className="cursor-pointer transition-transform hover:scale-105">
                {/* @ts-expect-error - TODO: fix this */}
                <ContestBanner contest={contest} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
