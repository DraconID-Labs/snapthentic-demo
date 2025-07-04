"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import type { StepComponentProps } from "../page";

export function SummaryStep({ data, prev }: StepComponentProps) {
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    snapId?: string;
  } | null>(null);

  const createSnapMutation = api.snaps.create.useMutation({
    onSuccess: (result) => {
      setSubmitResult({
        success: true,
        message: "Snap submitted successfully!",
        snapId: result.id,
      });
    },
    onError: (error) => {
      setSubmitResult({
        success: false,
        message: error.message || "Failed to submit snap",
      });
    },
  });

  const handleSubmit = async () => {
    if (!data.photo || !data.hash || !data.signature?.success) {
      setSubmitResult({
        success: false,
        message: "Missing required data. Please complete all steps.",
      });
      return;
    }

    setSubmitResult(null);

    createSnapMutation.mutate({
      photoData: data.photo,
      hash: data.hash,
      signature: data.signature.signature,
      signerAddress: data.signature.address,
      signatureVersion: data.signature.version.toString(),
      title: `Snap ${new Date().toLocaleDateString()}`,
      description: "Authenticated photo snap",
      isPublic: true,
    });
  };

  const canSubmit = data.photo && data.hash && data.signature?.success;
  const isSubmitting = createSnapMutation.isPending;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Summary</h2>

      <div className="space-y-2">
        <h3 className="font-semibold">Photo</h3>
        {data.photo ? (
          <img src={data.photo} alt="summary" className="max-h-64 rounded" />
        ) : (
          <p className="text-sm text-gray-600">No photo</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Hash</h3>
        {data.hash ? (
          <p className="break-all rounded bg-gray-100 p-2 text-xs">
            {data.hash}
          </p>
        ) : (
          <p className="text-sm text-gray-600">No hash</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Signature</h3>
        {data.signature?.success ? (
          <>
            <p className="break-all rounded bg-gray-100 p-2 text-xs">
              Signature: {data.signature.signature}
            </p>
            <p className="break-all rounded bg-gray-100 p-2 text-xs">
              Address: {data.signature.address}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">No signature</p>
        )}
      </div>

      {/* Submit Result */}
      {submitResult && (
        <div
          className={`rounded-lg p-4 ${
            submitResult.success
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">
            {submitResult.success ? "✓ Success" : "✗ Error"}
          </p>
          <p className="text-sm">{submitResult.message}</p>
          {submitResult.snapId && (
            <p className="mt-1 text-xs">Snap ID: {submitResult.snapId}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={prev} disabled={isSubmitting}>
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Submitting..." : "Submit Snap"}
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
