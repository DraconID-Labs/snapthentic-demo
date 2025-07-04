"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { env } from "~/env";

const LazyInitializedEruda = dynamic(
  () => import("./eruda-init").then((c) => c.WithEruda),
  {
    ssr: false,
  },
);

export function ErudaProvider(props: { children: ReactNode }) {
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    return props.children;
  }
  return <LazyInitializedEruda>{props.children}</LazyInitializedEruda>;
}
