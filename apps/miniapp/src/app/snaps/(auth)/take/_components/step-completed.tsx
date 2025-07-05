"use client";

import { ArrowRight, HeartCrack, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { StepProps } from "../page";

export function StepCompleted({ data }: StepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {data.submitResult?.success && (
        <div className="mx-auto flex max-w-fit flex-col items-center gap-2">
          <PartyPopper className="size-[100px] animate-pulse text-blue-300" />
          <p className="text-lg font-semibold">Snap submitted successfully!</p>
        </div>
      )}
      {!data.submitResult?.success && (
        <div className="mx-auto flex max-w-fit flex-col items-center gap-2">
          <HeartCrack className="size-[100px] animate-pulse text-red-500/70" />
          <p className="text-lg font-semibold">Snap submitted failed!</p>
          <p className="text-sm text-gray-600">{data.submitResult?.message}</p>
        </div>
      )}
      {data.submitResult?.snapId && (
        <Link href={`/snaps/${data.submitResult.snapId}`}>
          <Button variant={"default"}>
            View Snap <ArrowRight className="size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
