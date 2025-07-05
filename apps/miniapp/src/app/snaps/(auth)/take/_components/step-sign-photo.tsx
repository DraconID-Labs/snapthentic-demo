"use client";

import { Signature } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Code } from "~/components/ui/code";
import { useSignMessage } from "../../../_hooks/use-sign-message";
import { hashMessage } from "../../../_utils/hash-photo";
import type { StepProps } from "./types";
import { prefixSignature } from "@snapthentic/signatures";

export function SignPhotoStep({ data, updateData, next }: StepProps) {
  const { signedMessage, sign } = useSignMessage();
  const [hash, setHash] = useState<string | undefined>();

  useEffect(() => {
    const generateHash = async () => {
      if (!data.photo) return;
      const h = await hashMessage(data.photo);
      setHash(h);
    };
    void generateHash();
  }, [data.photo]);

  const startSigning = async () => {
    if (!hash) return;
    const prefixedHash = prefixSignature(hash);
    await sign(prefixedHash);
  };

  useEffect(() => {
    if (signedMessage?.success) {
      updateData({ signature: signedMessage, hash });
      next();
    }
  }, [signedMessage, updateData, next, hash]);

  return (
    <div className="space-y-4">
      {!hash && (
        <p className="text-sm text-gray-600">
          No hash present. Please generate a hash first.
        </p>
      )}

      {hash && !signedMessage && (
        <div className="mx-auto flex max-w-fit flex-col items-center gap-2">
          <Signature className="size-[100px] text-gray-600/40" />
          <p className="text-lg font-semibold">We need your signature!</p>
          <Code className="w-4/5 overflow-x-auto text-center">
            {prefixSignature(hash)}
          </Code>
          <Button onClick={startSigning}>Sign Hash</Button>
        </div>
      )}
    </div>
  );
}
