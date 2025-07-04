import { Loader2 as LoaderIcon } from "lucide-react";
import { cn } from "~/utils/cn";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-full min-h-screen items-center justify-center",
        className,
      )}
    >
      <LoaderIcon className="size-8 animate-spin" />
    </div>
  );
}
