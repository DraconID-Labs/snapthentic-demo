import { db } from "~/server/database";
import { ContestBanner } from "./_componenets/contest-banner";

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
      <h1 className="mb-2 w-full text-left text-2xl font-bold">Contests</h1>
      {contests.map((contest) => (
        // @ts-expect-error - TODO: fix this
        <ContestBanner key={contest.id} contest={contest} />
      ))}
    </div>
  );
}
