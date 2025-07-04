"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useGenerateProof } from "./_hooks/use-generate-proof";
import { useSubmitProof } from "./_hooks/use-submit-proof";
import { Loader } from "~/components/ui/loader";

export default function Page() {
  const router = useRouter();
  const {
    data: proofs,
    isLoading,
    isError,
  } = api.proofs.proofExists.useQuery({
    action: "create-snapthentic-profile",
  });

  const queryClient = useQueryClient();

  const [success, setSuccess] = useState(false);

  const { submit } = useSubmitProof(() => {
    setSuccess(true);
  });

  const { generateProof } = useGenerateProof((proof) => {
    void submit(proof);
  });

  if (isLoading) return <Loader />;

  if (isError) return <div>Error</div>;

  if (proofs) {
    void queryClient.invalidateQueries().then(() => {
      router.push("/profile");
    });
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {!success && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Join Snapthentic!</h1>
            <p>Let&apos;s verify and enjoy the app!</p>
          </div>

          <Button onClick={generateProof} variant={"secondary"}>
            Verify identity
          </Button>
        </div>
      )}
    </div>
  );
}
