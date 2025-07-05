import { snaps } from "@snapthentic/database/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/database";
import { SnapCard } from "../_components/snap-card";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function isUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

export default async function SnapPage(props: Props) {
  const { id } = await props.params;
  if (!isUUID(id)) {
    return notFound();
  }

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
