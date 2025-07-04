import {
  type MiniAppSignMessagePayload,
  MiniKit,
  type SignMessageInput,
} from "@worldcoin/minikit-js";

export type SignedMessage =
  | {
      success: true;
      signature: string;
      address: string;
      version: number;
    }
  | {
      success: false;
    };

export async function signMessage(message: string): Promise<SignedMessage> {
  console.log("signMessage", message, typeof message);
  const signMessagePayload: SignMessageInput = {
    message,
  };

  const { finalPayload } =
    await MiniKit.commandsAsync.signMessage(signMessagePayload);

  return toSignedMessage(finalPayload);
}

function toSignedMessage(
  finalPayload: MiniAppSignMessagePayload,
): SignedMessage {
  if (finalPayload.status === "success") {
    return {
      success: true,
      signature: finalPayload.signature,
      address: finalPayload.address,
      version: finalPayload.version,
    };
  }

  return {
    success: false,
  };
}
