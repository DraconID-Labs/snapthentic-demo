import type { ContestWithSnapContests } from "@snapthentic/database/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Countdown } from "./countdown";
import { Badge } from "~/components/ui/badge";

export function ContestBanner({
  contest,
}: {
  contest: ContestWithSnapContests;
}) {
  const votes = contest.snapContests.reduce(
    (acc, snap) => acc + snap.votes.length,
    0,
  );
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <CardTitle>{contest.title}</CardTitle>
          {contest.active && <Badge className="bg-green-500">Active</Badge>}
        </div>
        <CardDescription>{contest.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {contest.snapContests.length} snaps
            </p>
            <p className="text-sm text-gray-500">{votes} votes</p>
          </div>
          {contest.endDate && <Countdown endDate={contest.endDate} />}
        </div>
      </CardContent>
    </Card>
  );
}
