"use client";

import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import type { StepProps } from "./types";

export function StepSummary({ data, updateData, next }: StepProps) {
  // Get contest information if contestId is provided
  const { data: contest } = api.contests.getById.useQuery(
    { id: data.contestId! },
    { enabled: !!data.contestId }
  );

  const createSnapMutation = api.snaps.create.useMutation({
    onSuccess: (result) => {
      updateData({
        submitResult: {
          success: true,
          message: data.contestId 
            ? "Snap submitted and entered into contest successfully!"
            : "Snap submitted successfully!",
          snapId: result.id,
        },
      });
      next();
    },
    onError: (error) => {
      updateData({
        submitResult: {
          success: false,
          message: error.message || "Failed to submit snap",
        },
      });
    },
  });

  const handleSubmit = async () => {
    if (!data.photo || !data.hash || !data.signature?.success) {
      updateData({
        submitResult: {
          success: false,
          message: "Missing required data. Please complete all steps.",
        },
      });
      return;
    }

    createSnapMutation.mutate({
      photoData: data.photo,
      hash: data.hash,
      signature: data.signature.signature,
      signerAddress: data.signature.address,
      signatureVersion: data.signature.version.toString(),
      title: data.title ?? `Snap ${new Date().toLocaleDateString()}`,
      description: data.description ?? "Authenticated photo snap",
      isPublic: true,
      contestId: data.contestId, // Pass contest ID
    });
  };

  const canSubmit = data.photo && data.hash && data.signature?.success;
  const isSubmitting = createSnapMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        {data.photo ? (
          <img
            src={data.photo}
            alt="summary"
            className="mx-auto max-h-64 rounded"
          />
        ) : (
          <p className="text-sm text-gray-600">No photo</p>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Title</h3>
        {data.title ? (
          <>
            <p className="break-all rounded bg-gray-100 p-2 font-mono text-xs">
              {data.title}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">No title</p>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Description</h3>
        {data.description ? (
          <p className="break-all rounded bg-gray-100 p-2 font-mono text-xs">
            {data.description}
          </p>
        ) : (
          <p className="text-sm text-gray-600">No description</p>
        )}
      </div>

      {/* Contest Information */}
      {data.contestId && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Contest Entry</h3>
          {contest ? (
            <div className="rounded border border-blue-200 bg-blue-50 p-2">
              <p className="text-sm font-medium text-blue-900">{contest.title}</p>
              <p className="text-xs text-blue-700">{contest.description}</p>
              <div className="mt-2 flex gap-4 text-xs">
                {contest.entryPrice && (
                  <span className="text-green-600">
                    Entry: ${Number(contest.entryPrice).toFixed(2)}
                  </span>
                )}
                {contest.prize && (
                  <span className="text-blue-600">
                    Prize: ${Number(contest.prize).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Loading contest information...</p>
          )}
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Hash</h3>
        {data.hash ? (
          <p className="break-all rounded bg-gray-100 p-2 font-mono text-xs">
            {data.hash}
          </p>
        ) : (
          <p className="text-sm text-gray-600">No hash</p>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Signature</h3>
        {data.signature?.success ? (
          <>
            <p className="break-all rounded bg-gray-100 p-2 font-mono text-xs">
              {data.signature.signature}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">No signature</p>
        )}
      </div>

      <div className="flex justify-center gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="min-w-[150px]"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : (
            data.contestId ? "Submit & Enter Contest" : "Submit Snap"
          )}
        </Button>
      </div>

      {!canSubmit && (
        <p className="text-center text-sm text-gray-500">
          Complete all previous steps to enable submission
        </p>
      )}
    </div>
  );
}
