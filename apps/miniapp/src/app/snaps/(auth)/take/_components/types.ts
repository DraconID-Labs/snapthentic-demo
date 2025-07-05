import type { SignedMessage } from "~/app/snaps/_utils/sign-message";

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
