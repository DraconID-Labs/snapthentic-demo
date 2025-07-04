import { type InsertSnap, snaps } from "@snapthentic/database/schema";
import { encodeMessage, imageToBuffer } from "@snapthentic/stenography";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { registerSnapOnChain } from "~/blockchain/register-snap-onchain";
import { uploadToCloudinary } from "~/cloudinary/upload";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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

      function base64ToBuffer(base64: string): Buffer {
        const matches = /^data:([A-Za-z-+/]+);base64,(.+)$/.exec(base64);

        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 string");
        }

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const imageBuffer = Buffer.from(matches[2]!, "base64");
        return imageBuffer;
      }

      console.time("base64ToBuffer");
      const imageBuffer = base64ToBuffer(input.photoData);
      console.timeEnd("base64ToBuffer");

      console.time("uploadToCloudinary");
      const cloudinaryResponse = await uploadToCloudinary(imageBuffer);
      console.timeEnd("uploadToCloudinary");

      if (!cloudinaryResponse) {
        throw new Error("Failed to upload photo to Cloudinary");
      }

      const newSnap: InsertSnap = {
        userId: ctx.session.user.id,
        photoData: cloudinaryResponse.url,
        signedPhotoData: undefined, // !
        hash: hexHash,
        signature: hexSignature,
        signerAddress: hexSignerAddress,
        signatureVersion: input.signatureVersion,
        title: input.title,
        description: input.description,
        isPublic: input.isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.time("insertSnap");
      const [insertedSnap] = await ctx.db
        .insert(snaps)
        .values(newSnap)
        .returning();
      console.timeEnd("insertSnap");

      console.time("registerSnapOnChain");
      const { txHash } = await registerSnapOnChain(
        input.signerAddress,
        hexSignature,
        hexHash,
      );
      console.timeEnd("registerSnapOnChain");

      console.time("encodeMessage");
      const encoded = await encodeMessage(imageBuffer, txHash);
      console.timeEnd("encodeMessage");

      console.time("imageToBuffer");
      const modifiedBuffer = await imageToBuffer(encoded.image);
      console.timeEnd("imageToBuffer");

      console.time("uploadToCloudinary2");
      const cloudinaryResponse2 = await uploadToCloudinary(modifiedBuffer);
      console.timeEnd("uploadToCloudinary2");

      if (!cloudinaryResponse2) {
        throw new Error("Failed to upload photo to Cloudinary");
      }

      console.time("updateSnap");
      await ctx.db
        .update(snaps)
        .set({
          signedPhotoData: cloudinaryResponse2.url,
          txHash,
        })
        // biome-ignore lint/style/noNonNullAssertion: just inserted
        .where(eq(snaps.id, insertedSnap!.id));
      console.timeEnd("updateSnap");

      return {
        id: insertedSnap?.id,
        createdAt: insertedSnap?.createdAt,
      };
    }),

  getMySnaps: protectedProcedure.query(async ({ ctx }) => {
    const userSnaps = await ctx.db
      .select({
        id: snaps.id,
        hash: snaps.hash,
        title: snaps.title,
        description: snaps.description,
        isPublic: snaps.isPublic,
        createdAt: snaps.createdAt,
        photoData: snaps.photoData,
      })
      .from(snaps)
      .where(eq(snaps.userId, ctx.session.user.id))
      .orderBy(desc(snaps.createdAt));

    return userSnaps;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const snap = await ctx.db
        .select()
        .from(snaps)
        .where(eq(snaps.id, input.id))
        .limit(1);

      return snap[0] ?? null;
    }),
});

const ensureHexPrefix = (input: string) => {
  if (input.startsWith("0x")) {
    return input;
  }

  return `0x${input}`;
};
