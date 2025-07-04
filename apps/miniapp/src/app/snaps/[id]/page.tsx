import { snaps } from "@snapthentic/database/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Image from "next/image";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SnapPage(props: Props) {
  const { id } = await props.params;

  const snap = await db.query.snaps.findFirst({
    where: eq(snaps.id, id),
    with: {
      author: true,
    },
  });

  if (!snap) {
    return <div>Snap not found</div>;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        <Avatar className="size-10">
          <AvatarImage src={snap.author.avatarUrl ?? undefined} />
          <AvatarFallback>
            {snap.author?.displayName?.slice(0, 2) ?? "Unknown"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-xs">
          <h1 className="font-bold">@{snap.author.displayName}</h1>
          <p className="text-gray-500">{snap.author.bio ?? "No bio"}</p>
        </div>
      </div>
      <div className="-mx-4 h-[500px] w-full">
        <Image
          objectFit="cover"
          width={410}
          height={500}
          src={snap.photoData}
          alt={snap.title ?? ""}
          className=""
        />
      </div>
    </div>
  );
}
