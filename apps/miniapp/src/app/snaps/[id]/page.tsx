import { snaps } from "@snapthentic/database/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "~/env";
import { db } from "~/server/database";
import { SnapDetailView } from "./snap-detail-view";

export async function generateMetadata(props: Props): Promise<Metadata> {
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

  const datePretty = snap.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    title: `Snapthentic: Authentic Snap captured on ${datePretty}`,
    description: `Authentic Snap captured on ${datePretty} by real human via World ID`,
    openGraph: {
      title: `Snapthentic: Authentic Snap captured on ${datePretty}`,
      description: `Authentic Snap captured on ${datePretty} by real human via World ID`,
      url: `${env.NEXT_PUBLIC_APP_URL}/snaps/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Snapthentic: Authentic Snap captured on ${datePretty}`,
      description: `Authentic Snap captured on ${datePretty} by real human via World ID`,
      site: "@snapthentic",
      creator: "@snapthentic",
    },
  };
}

export type Props = {
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

  return <SnapDetailView snap={snap} />;
}
