"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useSignMessage } from "../_hooks/use-sign-message";
import type { StepComponentProps } from "../page";
import { prefixSignature } from "@snapthentic/signatures";

export function SignPhotoStep({
  data,
  updateData,
  next,
  prev,
}: StepComponentProps) {
  const { signedMessage, sign } = useSignMessage();

  const startSigning = async () => {
    if (!data.hash) return;
    const prefixedHash = prefixSignature(data.hash);
    await sign(prefixedHash);
  };

  useEffect(() => {
    if (signedMessage?.success) {
      updateData({ signature: signedMessage });
      next();
    }
  }, [signedMessage, updateData, next]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sign Hash</h2>

      {!data.hash && (
        <p className="text-sm text-gray-600">
          No hash present. Please generate a hash first.
        </p>
      )}

      {data.hash && !signedMessage && (
        <Button onClick={startSigning}>Sign Hash</Button>
      )}

      {signedMessage?.success && (
        <div className="space-y-2">
          <p className="break-all rounded bg-gray-100 p-2 text-xs">
            Signature: {signedMessage.signature}
          </p>
          <p className="break-all rounded bg-gray-100 p-2 text-xs">
            Address: {signedMessage.address}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={prev}>
          Back
        </Button>
        {/* next auto triggered when signed */}
      </div>
    </div>
  );
}
