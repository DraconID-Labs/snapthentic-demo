import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function SnapDelete({ snap }: { snap: SnapWithAuthor }) {
  const utils = api.useUtils();
  const router = useRouter();

  const { mutate: deleteSnap } = api.snaps.delete.useMutation({
    onSuccess: () => {
      void Promise.all([
        utils.snaps.getMySnaps.invalidate(),
        utils.snaps.getFeed.invalidate(),
        utils.snaps.getByAuthorId.invalidate({ authorId: snap.author.userId }),
        utils.contests.getMyEntries.invalidate(),
      ]);
      // Redirect to profile page after successful deletion
      router.push("/profile/me");
    },
  });

  return (
    <Button
      variant="ghost"
      className="h-auto w-full text-red-500"
      onClick={() => deleteSnap({ snapId: snap.id })}
    >
      <Trash className="size-4" />
      <span>Delete</span>
    </Button>
  );
}
