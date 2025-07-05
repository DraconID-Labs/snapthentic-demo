import { cn } from "~/utils/cn";

export function Code({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "flex items-center text-wrap break-all rounded-sm border border-gray-900 bg-gray-100 p-2 text-xs",
        className,
      )}
    >
      {children}
    </pre>
  );
}
