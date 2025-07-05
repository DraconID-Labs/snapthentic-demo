import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function SnapDelete({ snap }: { snap: SnapWithAuthor }) {
  const utils = api.useUtils();

  const { mutate: deleteSnap } = api.snaps.delete.useMutation({
    onSuccess: () => {
      void Promise.all([
        utils.snaps.getMySnaps.invalidate(),
        utils.snaps.getFeed.invalidate(),
        utils.snaps.getByAuthorId.invalidate({ authorId: snap.author.userId }),
      ]);
    },
  });

  return (
    <Button
      variant="ghost"
      className="w-full text-red-500"
      onClick={() => deleteSnap({ snapId: snap.id })}
    >
      <Trash className="size-4" />
      <span>Delete</span>
    </Button>
  );
}
