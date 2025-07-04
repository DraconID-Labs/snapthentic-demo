import type { LucideIcon } from "lucide-react";

interface StepTimelineProps {
  steps: { id: string; title: string; icon: LucideIcon }[];
  currentStepIdx: number;
}

export function StepTimeline({ steps, currentStepIdx }: StepTimelineProps) {
  return (
    <ol className="relative ml-4">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIdx;
        const isActive = idx === currentStepIdx;
        return (
          <li key={step.id} className="relative pb-8 last:pb-0">
            {idx < steps.length - 1 && (
              <span className="absolute left-0 top-3 -ml-px h-full w-0.5 bg-gray-300" />
            )}

            <span
              className={`absolute -left-4 flex size-7 items-center justify-center rounded-full border text-xs
                ${isCompleted || isActive ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-500"}`}
            >
              <step.icon className="size-4" />
            </span>

            <p
              className={`${isActive ? "font-semibold text-gray-900" : "text-gray-600"} pl-4`}
            >
              {step.title}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
