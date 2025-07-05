import type * as React from "react";

import { cn } from "~/utils/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive  flex min-h-16 w-full rounded-md border border-gray-400 bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] placeholder:text-gray-400 focus-visible:border-ring focus-visible:ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
