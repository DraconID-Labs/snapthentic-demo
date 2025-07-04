import { type InsertSnap, snaps } from "@snapthentic/database/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { registerSnapOnChain } from "~/blockchain/submit-snap";
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
      const newSnap: InsertSnap = {
        userId: ctx.session.user.id,
        photoData: input.photoData,
        hash: input.hash,
        signature: input.signature,
        signerAddress: input.signerAddress,
        signatureVersion: input.signatureVersion,
        title: input.title,
        description: input.description,
        isPublic: input.isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [insertedSnap] = await ctx.db
        .insert(snaps)
        .values(newSnap)
        .returning();

      const { txHash, receipt } = await registerSnapOnChain(
        input.signerAddress,
        input.signature,
        input.hash,
      );

      console.log(txHash, receipt);

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
