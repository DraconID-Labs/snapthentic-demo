"use client"; // Required for Next.js

import { MiniKit } from "@worldcoin/minikit-js";
import { type ReactNode, useEffect } from "react";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install();
    console.log("Installed: ", MiniKit.isInstalled());
  }, []);

  return <>{children}</>;
}
