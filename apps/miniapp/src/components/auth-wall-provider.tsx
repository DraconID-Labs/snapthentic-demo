"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { Loader } from "./ui/loader";
import { loginWithWallet } from "./wallet-auth";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

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

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <Lock className="size-10" />
        <Button
          variant="outline"
          onClick={() => {
            void loginWithWallet();
          }}
        >
          Login using your wallet
        </Button>
      </div>
    );
  }

  return null;
}
