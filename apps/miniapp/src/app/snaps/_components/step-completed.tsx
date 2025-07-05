"use client";

import { ArrowRight, HeartCrack, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { SnapDrawerContentProps } from "./snap-drawer-content";

export function StepCompleted({ data }: SnapDrawerContentProps) {
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
      {/* <div className="w-full">
        {data.submitResult && (
          <div
            className={`rounded-lg p-4 ${
              data.submitResult.success
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {data.submitResult.success ? "✓ Success" : "✗ Error"}
            </p>
            <p className="text-sm">{data.submitResult.message}</p>
            {data.submitResult.snapId && (
              <p className="mt-1 text-xs">
                Snap ID: {data.submitResult.snapId}
              </p>
            )}
          </div>
        )}
      </div> */}
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
