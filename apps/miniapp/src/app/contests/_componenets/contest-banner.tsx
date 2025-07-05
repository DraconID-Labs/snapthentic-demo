import type { ContestWithSnapContests } from "@snapthentic/database/schema";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Countdown } from "./countdown";

export function ContestBanner({
  contest,
}: {
  contest: ContestWithSnapContests;
}) {
  const votes = contest.snapContests.reduce(
    (acc, snap) => acc + snap.votes.length,
    0,
  );

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "Free";
    return `${Number(amount).toFixed(2)} WLD`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <CardTitle>{contest.title}</CardTitle>
          {contest.active && <Badge className="bg-green-500">Active</Badge>}
        </div>
        <CardDescription>{contest.description}</CardDescription>

        {/* Entry Price and Prize Display */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Entry Fee:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(contest.entryPrice)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Prize:</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(contest.prize)}
            </span>
          </div>
        </div>
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
