import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export function SnapEdit({ snap }: { snap: SnapWithAuthor }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="w-full"
      onClick={() => router.push(`/snaps/${snap.id}/edit`)}
    >
      <Edit className="size-4" />
      <span>Edit</span>
    </Button>
  );
}
