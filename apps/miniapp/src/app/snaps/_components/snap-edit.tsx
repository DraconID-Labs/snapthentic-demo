import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function SnapEdit({ snap }: { snap: SnapWithAuthor }) {
  return (
    <Button variant="ghost" className="h-auto w-full " asChild>
      <Link
        href={`/snaps/${snap.id}/edit`}
        className="flex w-full items-center px-2 py-1.5"
      >
        <Edit className="mr-2 size-4" />
        <span>Edit</span>
      </Link>
    </Button>
  );
}
