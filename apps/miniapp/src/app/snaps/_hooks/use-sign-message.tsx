import { useCallback, useState } from "react";
import { type SignedMessage, signMessage } from "../_utils/sign-message";

export function useSignMessage() {
  const [signedMessage, setSignedMessage] = useState<SignedMessage | null>(
    null,
  );

  const sign = useCallback(async (message: string) => {
    const signedMessage = await signMessage(message);
    if (signedMessage.success) {
      setSignedMessage(signedMessage);
    }
  }, []);

  return { signedMessage, sign };
}
