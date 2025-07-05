import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { DownloadCloud } from "lucide-react";
import { Button } from "~/components/ui/button";

export function SnapDownload({ snap }: { snap: SnapWithAuthor }) {
  return (
    <Button
      variant="ghost"
      className="w-full"
      onClick={() => {
        const a = document.createElement("a");
        a.href = snap.photoUrl;
        a.download = snap.title ?? "snap";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }}
    >
      <DownloadCloud className="size-4" />
      <span>Download</span>
    </Button>
  );
}
