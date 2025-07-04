"use client";

import { Button } from "~/components/ui/button";
import type { StepComponentProps } from "../page";

export function SummaryStep({ data, prev }: StepComponentProps) {
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

      <div className="pt-4">
        <Button variant="outline" onClick={prev}>
          Back
        </Button>
      </div>
    </div>
  );
}
