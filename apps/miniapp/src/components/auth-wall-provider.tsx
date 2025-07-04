"use client";

import { signIn, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { Loader } from "./ui/loader";

export function AuthWallProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  if (
    status === "authenticated"
    // env.NEXT_PUBLIC_NODE_ENV === "development"
  ) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <Loader />;
  }

  void signIn("worldcoin");
  return null;
}
