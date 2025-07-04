import { snaps } from "@snapthentic/database/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { SnapCard } from "../_components/snap-card";

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

  return <SnapCard snap={snap} />;
}
