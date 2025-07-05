"use client";

import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ImageViewer } from "~/components/ui/image-viewer";
import { SnapCard } from "../_components/snap-card";

// Extended type for snap with like information
type SnapWithLikes = SnapWithAuthor & {
  likeCount?: number;
  isLikedByUser?: boolean;
};

interface SnapDetailViewProps {
  snap: SnapWithLikes;
}

export function SnapDetailView({ snap }: SnapDetailViewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const session = useSession();

  return (
    <div className="mx-auto max-w-2xl">
      <SnapCard
        snap={snap}
        onBodyClick={() => setIsViewerOpen(true)}
        isOwner={session.data?.user.id === snap.author.userId}
      />

      <ImageViewer
        src={snap.photoUrl}
        alt={snap.title ?? "Snap photo"}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
