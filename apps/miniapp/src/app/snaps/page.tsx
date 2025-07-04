"use client";

import { useCallback, useState } from "react";
import {
  type LucideIcon,
  Camera,
  Hash,
  PenTool,
  FileCheck,
} from "lucide-react";
import { StepTimeline } from "./_components/step-timeline";
import { TakePhotoStep } from "./_components/step-take-photo";
import { HashPhotoStep } from "./_components/step-hash-photo";
import { SignPhotoStep } from "./_components/step-sign-photo";
import { SummaryStep } from "./_components/step-summary";
import type { SignedMessage } from "./_utils/sign-message";

// Shared data that flows through the wizard
interface SnapData {
  photo?: string;
  hash?: string;
  signature?: SignedMessage;
}

// Props that every step component receives
export interface StepComponentProps {
  data: SnapData;
  updateData: (partial: Partial<SnapData>) => void;
  next: () => void;
  prev: () => void;
}

interface StepDefinition {
  id: string;
  title: string;
  icon: LucideIcon;
  Component: React.FC<StepComponentProps>;
}

const STEPS: StepDefinition[] = [
  {
    id: "photo",
    title: "Take Photo",
    icon: Camera,
    Component: TakePhotoStep,
  },
  {
    id: "hash",
    title: "Hash Photo",
    icon: Hash,
    Component: HashPhotoStep,
  },
  {
    id: "sign",
    title: "Sign Photo",
    icon: PenTool,
    Component: SignPhotoStep,
  },
  {
    id: "summary",
    title: "Summary",
    icon: FileCheck,
    Component: SummaryStep,
  },
];

export default function Page() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [data, setData] = useState<SnapData>({});

  const updateData = useCallback((partial: Partial<SnapData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const next = useCallback(() => {
    setCurrentStepIdx((idx) => Math.min(idx + 1, STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentStepIdx((idx) => Math.max(idx - 1, 0));
  }, []);

  const CurrentStep = STEPS[currentStepIdx]?.Component ?? (() => null);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Vertical timeline */}
        <StepTimeline steps={STEPS} currentStepIdx={currentStepIdx} />

        {/* Step container */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <CurrentStep
            data={data}
            updateData={updateData}
            next={next}
            prev={prev}
          />
        </div>
      </div>
    </div>
  );
}
