"use client";

import { useCallback, useState } from "react";
import { TakePhotoStep } from "./_components/step-take-photo";
import { SignPhotoStep } from "./_components/step-sign-photo";
import { StepSummary } from "./_components/step-summary";
import { StepCompleted } from "./_components/step-completed";
import { cn } from "~/utils/cn";
import type { SignedMessage } from "../../_utils/sign-message";
import { Button } from "~/components/ui/button";
import { CheckIcon, Redo } from "lucide-react";
import { StepDetails } from "./_components/step-details";

const steps = [
  {
    id: "photo",
    title: "Take a photo",
    description: "Let's capture the moment",
    component: TakePhotoStep,
  },
  {
    id: "details",
    title: "Snap details",
    description: "Add a title and description",
    component: StepDetails,
  },
  {
    id: "sign",
    title: "Sign the snap",
    description: "Sign the snap to make it yours",
    component: SignPhotoStep,
  },
  {
    id: "summary",
    title: "Summary",
    description: "Review your snap",
    component: StepSummary,
  },
  {
    id: "completed",
    title: "Completed",
    description: "Your snap has been created",
    component: StepCompleted,
  },
];

export interface SnapData {
  photo?: string;
  hash?: string;
  signature?: SignedMessage;
  title?: string;
  description?: string;
  submitResult?: {
    success: boolean;
    message: string;
    snapId?: string;
  };
}

export interface StepProps {
  data: SnapData;
  updateData: (partial: Partial<SnapData>) => void;
  currentStepIdx: number;
  next: () => void;
  prev: () => void;
}

export default function Page() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [snapData, setSnapData] = useState<SnapData>({});

  const updateSnapData = useCallback((partial: Partial<SnapData>) => {
    setSnapData((prev) => ({ ...prev, ...partial }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIdx((idx) => Math.min(idx + 1, steps.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIdx((idx) => Math.max(idx - 1, 0));
  }, []);

  const StepComponent = steps[currentStepIdx]?.component ?? (() => null);

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, idx) => (
        <StepContainer
          key={step.id}
          title={step.title}
          description={step.description}
          isCompleted={idx < currentStepIdx}
          isActive={idx === currentStepIdx}
          onBack={
            idx === currentStepIdx && idx !== 0 && idx !== steps.length - 1
              ? prevStep
              : undefined
          }
        >
          {idx === currentStepIdx && (
            <StepComponent
              data={snapData}
              updateData={updateSnapData}
              currentStepIdx={currentStepIdx}
              next={nextStep}
              prev={prevStep}
            />
          )}
        </StepContainer>
      ))}
    </div>
  );
}

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
