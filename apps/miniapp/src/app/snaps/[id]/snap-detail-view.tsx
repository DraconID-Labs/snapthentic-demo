"use client";

import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { useState } from "react";
import { ImageViewer } from "~/components/ui/image-viewer";
import { SnapCard } from "../_components/snap-card";

interface SnapDetailViewProps {
  snap: SnapWithAuthor;
}

export function SnapDetailView({ snap }: SnapDetailViewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <SnapCard snap={snap} onBodyClick={() => setIsViewerOpen(true)} />

      <ImageViewer
        src={snap.photoUrl}
        alt={snap.title ?? "Snap photo"}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
