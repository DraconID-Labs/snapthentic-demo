"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useGenerateProof } from "../_hooks/use-generate-proof";
import { useSubmitProof } from "../_hooks/use-submit-proof";

export function CreateProfile() {
  const utils = api.useUtils();

  const { submit } = useSubmitProof(() => {
    void utils.userProfile.getMyProfile.invalidate();
    void utils.snaps.getMySnaps.invalidate();
  });

  const { generateProof } = useGenerateProof((proof) => {
    void submit(proof);
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Join Snapthentic!</h1>
          <p>Let&apos;s verify and enjoy the app!</p>
        </div>

        <Button onClick={generateProof} variant={"secondary"}>
          Verify identity
        </Button>
      </div>
    </div>
  );
}
