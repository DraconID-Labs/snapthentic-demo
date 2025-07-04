"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { hashMessage } from "../_utils/hash-photo";
import type { StepComponentProps } from "../page";

export function HashPhotoStep({
  data,
  updateData,
  next,
  prev,
}: StepComponentProps) {
  const [hash, setHash] = useState<string | undefined>(data.hash);
  const [loading, setLoading] = useState(false);

  const generateHash = async () => {
    if (!data.photo) return;
    setLoading(true);
    const h = await hashMessage(data.photo);
    updateData({ hash: h });
    setHash(h);
    setLoading(false);
  };

  const canProceed = Boolean(hash);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Hash Photo</h2>

      {!data.photo && (
        <p className="text-sm text-gray-600">
          No photo available. Please go back and take a photo first.
        </p>
      )}

      {data.photo && !hash && (
        <Button onClick={generateHash} disabled={loading}>
          {loading ? "Generating..." : "Generate Hash"}
        </Button>
      )}

      {hash && (
        <div className="space-y-2">
          <p className="break-all rounded bg-gray-100 p-2 text-xs">{hash}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={prev}>
          Back
        </Button>
        <Button onClick={next} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  );
}
