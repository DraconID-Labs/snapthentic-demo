import {
  type InsertUserProfile,
  proofs,
  userProfiles,
} from "@snapthentic/database/schema";
import { TRPCError } from "@trpc/server";
import { VerificationLevel, verifyCloudProof } from "@worldcoin/minikit-js";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  type Config as UniqueNamesConfig,
} from "unique-names-generator";

const config = {
  dictionaries: [colors, adjectives, animals],
  separator: "",
  style: "capital",
} satisfies UniqueNamesConfig;

const WorldCoinSuccessResultSchema = z.object({
  proof: z.string(),
  merkle_root: z.string(),
  nullifier_hash: z.string(),
  verification_level: z.nativeEnum(VerificationLevel),
});

export const proofsRouter = createTRPCRouter({
  proofExists: protectedProcedure
    .input(
      z.object({
        action: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const proof = await ctx.db
        .select()
        .from(proofs)
        .where(
          and(
            eq(proofs.userId, ctx.session.user.id),
            eq(proofs.action, input.action),
          ),
        )
        .limit(1);

      return proof[0] ?? null;
    }),

  createProof: protectedProcedure
    .input(
      z.object({
        payload: WorldCoinSuccessResultSchema,
        action: z.string(),
        signal: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appId = env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`;

      const result = await verifyCloudProof(
        input.payload,
        appId,
        input.action,
        input.signal,
      );

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.detail,
        });
      }

      await ctx.db
        .insert(proofs)
        .values({
          userId: ctx.session.user.id,
          proof: input.payload.proof,
          action: input.action,
          signal: input.signal,
        })
        .returning();

      const existingProfile = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.session.user.id))
        .limit(1);

      if (existingProfile.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User profile already exists",
        });
      }

      const randomName = uniqueNamesGenerator(config);

      const newProfile: InsertUserProfile = {
        nickname: ctx.session.user.username ?? randomName,
        displayName: ctx.session.user.username ?? randomName,
        avatarUrl: ctx.session.user.profilePictureUrl ?? "",
        bio: "",
        location: "",
        twitterHandle: "",
        instagramHandle: "",
        userId: ctx.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(userProfiles).values(newProfile).returning();
    }),
});
