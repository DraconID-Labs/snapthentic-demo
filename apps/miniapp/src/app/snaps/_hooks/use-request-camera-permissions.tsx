import {
  MiniKit,
  Permission,
  type RequestPermissionPayload,
} from "@worldcoin/minikit-js";
import { useCallback, useEffect, useState } from "react";
import { env } from "~/env";

type Payload = Awaited<
  ReturnType<typeof MiniKit.commandsAsync.requestPermission>
>;

export function useRequestCameraPermissions() {
  const [payload, setPayload] = useState<Payload | null>(null);

  const requestPermission = useCallback(async () => {
    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Microphone,
    };
    const payload = await MiniKit.commandsAsync.requestPermission(
      requestPermissionPayload,
    );
    setPayload(payload);
  }, []);

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  const permissionGranted =
    payload?.finalPayload.status === "success" ||
    env.NEXT_PUBLIC_NODE_ENV === "development";

  return permissionGranted;
}
