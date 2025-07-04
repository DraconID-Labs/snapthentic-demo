import type { ISuccessResult } from "@worldcoin/minikit-js";
import { api } from "~/trpc/react";

export function useSubmitProof(onSuccess: () => void) {
  const { mutate: createProof } = api.proofs.createProof.useMutation({
    onSuccess,
  });

  const submit = async (proof: ISuccessResult) => {
    createProof({
      action: "create-snapthentic-profile",
      payload: proof,
    });
  };

  return { submit };
}
