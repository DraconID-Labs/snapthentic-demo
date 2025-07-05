import { type InsertSnap, snaps } from "@snapthentic/database/schema";
import {
  decodeMessage,
  encodeMessage,
  imageToBuffer,
} from "@snapthentic/stenography";
import { randomUUID } from "node:crypto";
import { desc, eq, and, lt } from "drizzle-orm";
import { z } from "zod";
import { registerSnapOnChain } from "~/blockchain/register-snap-onchain";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { uploadToSupabase } from "~/supabase/upload";
import { getPublicUrl } from "~/supabase/get-public-url";
import {
  constructV1Signature,
  parseV1Signature,
} from "@snapthentic/signatures";

function base64ToBuffer(base64: string): Buffer {
  const jpegPrefix = "data:image/jpeg;base64,";
  const matches = base64.startsWith(jpegPrefix);

  if (!matches) {
    throw new Error("Not a JPEG stream.");
  }

  const imageBuffer = Buffer.from(base64.slice(jpegPrefix.length), "base64");
  return imageBuffer;
}

const CreateSnapSchema = z.object({
  photoData: z.string().min(1, "Photo data is required"),
  hash: z.string().min(1, "Hash is required"),
  signature: z.string().min(1, "Signature is required"),
  signerAddress: z.string().min(1, "Signer address is required"),
  signatureVersion: z.string().min(1, "Signature version is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
});

export const snapsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateSnapSchema)
    .mutation(async ({ ctx, input }) => {
      const hexHash = ensureHexPrefix(input.hash);
      const hexSignature = ensureHexPrefix(input.signature);
      const hexSignerAddress = ensureHexPrefix(input.signerAddress);

      const uuid = randomUUID();
      const filename = `${hexSignerAddress}-${hexHash}-${uuid}.jpeg`;

      console.time("registerSnapOnChain");
      const { txHash } = await registerSnapOnChain(
        input.signerAddress,
        hexSignature,
        hexHash,
      );
      console.timeEnd("registerSnapOnChain");

      const signaturePayload = constructV1Signature({
        signerAddress: hexSignerAddress,
        hash: hexHash,
        signature: hexSignature,
        txHash,
      });

      console.time("base64ToBuffer");
      const imageBuffer = base64ToBuffer(input.photoData);
      console.timeEnd("base64ToBuffer");

      console.time("encodeMessage");
      const encoded = await encodeMessage(imageBuffer, signaturePayload);
      console.timeEnd("encodeMessage");

      console.time("imageToBuffer");
      const modifiedBuffer = await imageToBuffer(encoded.image);
      console.timeEnd("imageToBuffer");

      console.time("uploadToSupabase");
      await uploadToSupabase(modifiedBuffer, filename);
      const publicUrl = getPublicUrl(filename);
      console.timeEnd("uploadToSupabase");

      const newSnap: InsertSnap = {
        userId: ctx.session.user.id,
        photoUrl: publicUrl,
        hash: hexHash,
        signature: hexSignature,
        signerAddress: hexSignerAddress,
        signatureVersion: input.signatureVersion,
        title: input.title,
        description: input.description,
        isPublic: input.isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
        txHash,
      };

      console.dir({ insert: newSnap }, { depth: null });

      console.time("insertSnap");
      const [insertedSnap] = await ctx.db
        .insert(snaps)
        .values(newSnap)
        .returning();
      console.timeEnd("insertSnap");

      return {
        id: insertedSnap?.id,
        createdAt: insertedSnap?.createdAt,
      };
    }),

  verify: publicProcedure
    .input(
      z.object({
        photoData: z.string().min(1, "Photo data is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = base64ToBuffer(input.photoData);
      const decoded = await decodeMessage(buffer);
      const payload = parseV1Signature(decoded.message);
      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.hash, payload.hash),
      });

      if (!snap) {
        throw new Error("Snap not found");
      }

      // TODO IN THE FUTURE
      // Strip data, re-hash image, verify signature against new hash based on the address
      // Send two separate results - one from backend, one based on actually verified data ;p
      return {
        snapId: snap.id,
        author: snap.userId,
        createdAt: snap.createdAt,
        txHash: snap.txHash,
        hash: snap.hash,
        signature: snap.signature,
        signerAddress: snap.signerAddress,
        signatureVersion: snap.signatureVersion,
        title: snap.title,
      };
    }),

  getMySnaps: protectedProcedure.query(async ({ ctx }) => {
    console.dir({ session: ctx.session });
    const userSnaps = await ctx.db
      .select({
        id: snaps.id,
        hash: snaps.hash,
        title: snaps.title,
        description: snaps.description,
        isPublic: snaps.isPublic,
        createdAt: snaps.createdAt,
        photoUrl: snaps.photoUrl,
      })
      .from(snaps)
      .where(eq(snaps.userId, ctx.session.user.id))
      .orderBy(desc(snaps.createdAt));

    return userSnaps;
  }),

  getByAuthorId: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const snapsFound = await ctx.db.query.snaps.findMany({
        where: eq(snaps.userId, input.authorId),
        orderBy: desc(snaps.createdAt),
      });

      return snapsFound;
    }),

  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      // Build where conditions
      const baseCondition = eq(snaps.isPublic, true);
      const whereConditions = [baseCondition];

      if (cursor) {
        const cursorSnap = await ctx.db
          .select({ createdAt: snaps.createdAt })
          .from(snaps)
          .where(eq(snaps.id, cursor))
          .limit(1);

        if (cursorSnap[0]) {
          whereConditions.push(lt(snaps.createdAt, cursorSnap[0].createdAt));
        }
      }

      const feed = await ctx.db.query.snaps.findMany({
        where:
          whereConditions.length > 1 ? and(...whereConditions) : baseCondition,
        orderBy: desc(snaps.createdAt),
        limit: limit + 1,
        with: {
          author: true,
        },
      });

      const hasMore = feed.length > limit;
      const items = hasMore ? feed.slice(0, limit) : feed;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return {
        items,
        nextCursor,
        hasMore,
      };
    }),
});

const ensureHexPrefix = (input: string) => {
  if (input.startsWith("0x")) {
    return input;
  }

  return `0x${input}`;
};
