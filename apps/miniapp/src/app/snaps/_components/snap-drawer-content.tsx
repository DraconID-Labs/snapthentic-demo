"use client";

import type { SignedMessage } from "../_utils/sign-message";
import { StepCompleted } from "./step-completed";
import { SignPhotoStep } from "./step-sign-photo";
import { StepSummary } from "./step-summary";
import { TakePhotoStep } from "./step-take-photo";

export interface SnapData {
  photo?: string;
  hash?: string;
  signature?: SignedMessage;
  submitResult?: {
    success: boolean;
    message: string;
    snapId?: string;
  };
}

export interface SnapDrawerContentProps {
  data: SnapData;
  updateData: (partial: Partial<SnapData>) => void;
  currentStepIdx: number;
  next: () => void;
  prev: () => void;
}

export const STEPS = [
  {
    id: "photo",
    Component: TakePhotoStep,
  },
  {
    id: "sign",
    Component: SignPhotoStep,
  },
  {
    id: "summary",
    Component: StepSummary,
  },
  {
    id: "completed",
    Component: StepCompleted,
  },
];

export function SnapDrawerContent({
  data,
  updateData,
  currentStepIdx,
  next,
  prev,
}: SnapDrawerContentProps) {
  const CurrentStep = STEPS[currentStepIdx]?.Component ?? (() => null);

  return (
    <div className="max-h-[800px] min-h-[300px] overflow-y-auto">
      <CurrentStep
        data={data}
        updateData={updateData}
        next={next}
        prev={prev}
        currentStepIdx={currentStepIdx}
      />
    </div>
  );
}
