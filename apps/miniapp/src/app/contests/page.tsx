import { db } from "~/server/database";
import { ContestBanner } from "./_componenets/contest-banner";
import Link from "next/link";

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
    <div className="flex min-h-screen flex-col items-center">
      <h1 className="mb-6 w-full text-left text-2xl font-bold">Contests</h1>
      <div className="w-full max-w-4xl space-y-4">
        {contests.map((contest) => (
          <Link key={contest.id} href={`/contests/${contest.id}`}>
            <div className="cursor-pointer transition-transform hover:scale-105">
              {/* @ts-expect-error - TODO: fix this */}
              <ContestBanner contest={contest} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
