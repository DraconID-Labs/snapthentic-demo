"use client";

import {
  Camera,
  FileCheck,
  Hash,
  type LucideIcon,
  PenTool,
} from "lucide-react";
import { useCallback, useState } from "react";
import { HashPhotoStep } from "./_components/step-hash-photo";
import { SignPhotoStep } from "./_components/step-sign-photo";
import { SummaryStep } from "./_components/step-summary";
import { TakePhotoStep } from "./_components/step-take-photo";
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
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-8">
        {/* Step container */}
        <CurrentStep
          data={data}
          updateData={updateData}
          next={next}
          prev={prev}
        />
      </div>
    </div>
  );
}
