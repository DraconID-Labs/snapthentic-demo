import { CheckIcon, Redo } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils/cn";

export function StepContainer(props: {
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border border-gray-300 p-4",
        "rounded-md",
        "text-gray-400",
        props.isActive && "text-gray-900",
        props.isCompleted && "border-green-500/40",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold leading-tight">{props.title}</h2>
          <p className={cn("text-xs text-muted-foreground")}>
            {props.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {props.isCompleted && (
            <Button variant="ghost" size="icon" className="text-green-500">
              <CheckIcon className="size-4" />
            </Button>
          )}
          {props.isActive && props.onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500"
              onClick={props.onBack}
            >
              <Redo className="size-4 -scale-x-100" />
            </Button>
          )}
        </div>
      </div>
      {props.children}
    </div>
  );
}
