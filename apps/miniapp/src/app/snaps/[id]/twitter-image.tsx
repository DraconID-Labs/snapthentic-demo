import { snaps } from "@snapthentic/database/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { db } from "~/server/database";

type Props = {
  params: Promise<{ id: string }>;
};

export const contentType = "image/jpeg";

function isUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

// Image generation
export default async function OpenGraphImage(props: Props) {
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
    return notFound();
  }

  return new ImageResponse(
    <img src={snap.photoUrl} alt={snap.title ?? "Snap"} />,
  );
}
