"use client";

import eruda from "eruda";
import { type ReactNode, useEffect } from "react";

export function WithEruda(props: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        eruda.init();
      } catch (error) {
        console.log("Eruda failed to initialize", error);
      }
    }
  }, []);

  return <>{props.children}</>;
}
