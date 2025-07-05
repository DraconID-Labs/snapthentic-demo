import { db } from "~/server/database";

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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Contests</h1>
      <pre>{JSON.stringify(contests, null, 2)}</pre>
    </div>
  );
}
