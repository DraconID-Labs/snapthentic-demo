import {
  type ISuccessResult,
  MiniKit,
  VerificationLevel,
} from "@worldcoin/minikit-js";

export function useGenerateProof(onSuccess: (payload: ISuccessResult) => void) {
  const generateProof = async () => {
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action: "create-snapthentic-profile",
      verification_level: VerificationLevel.Device,
    });

    if (finalPayload.status === "error") {
      return;
    }

    onSuccess(finalPayload);
  };

  return { generateProof };
}
