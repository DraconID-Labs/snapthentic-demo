"use client";

import { useCallback, useState } from "react";
import { StepCompleted } from "./_components/step-completed";
import { StepContainer } from "./_components/step-container";
import { StepDetails } from "./_components/step-details";
import { SignPhotoStep } from "./_components/step-sign-photo";
import { StepSummary } from "./_components/step-summary";
import { TakePhotoStep } from "./_components/step-take-photo";
import type { SnapData } from "./_components/types";

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
