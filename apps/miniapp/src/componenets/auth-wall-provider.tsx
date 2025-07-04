"use client";

import { signIn, useSession } from "next-auth/react";
import type { ReactNode } from "react";

export function AuthWallProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  void signIn("worldcoin");
  return null;
}
