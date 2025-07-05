import {
    type InsertUserProfile,
    userProfiles,
    follows,
} from "@snapthentic/database/schema";
import { TRPCError } from "@trpc/server";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

const createUserProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  twitterHandle: z.string().max(50).optional(),
  instagramHandle: z.string().max(50).optional(),
  isPublic: z.boolean().optional(),
});

const updateUserProfileSchema = createUserProfileSchema.pick({
  bio: true,
  location: true,
  twitterHandle: true,
  instagramHandle: true,
  isPublic: true,
});

export const userProfileRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.session.user.id),
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    // Get follower and following counts
    const [followersResult, followingResult] = await Promise.all([
      ctx.db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followingId, ctx.session.user.id)),
      ctx.db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followerId, ctx.session.user.id)),
    ]);

    return {
      ...profile,
      followersCount: followersResult[0]?.count ?? 0,
      followingCount: followingResult[0]?.count ?? 0,
    };
  }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Get follower and following counts
      const [followersResult, followingResult] = await Promise.all([
        ctx.db
          .select({ count: count() })
          .from(follows)
          .where(eq(follows.followingId, input.userId)),
        ctx.db
          .select({ count: count() })
          .from(follows)
          .where(eq(follows.followerId, input.userId)),
      ]);

      return {
        ...profile,
        followersCount: followersResult[0]?.count ?? 0,
        followingCount: followingResult[0]?.count ?? 0,
      };
    }),

  // Update user profile
  update: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if profile exists
      const existingProfile = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.session.user.id))
        .limit(1);

      if (existingProfile.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found. Create a profile first.",
        });
      }

      const result = await ctx.db
        .update(userProfiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, ctx.session.user.id))
        .returning();

      return result[0];
    }),

  // Delete user profile
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db
      .delete(userProfiles)
      .where(eq(userProfiles.userId, ctx.session.user.id))
      .returning();

    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return { success: true };
  }),

  // Create or update profile (upsert)
  upsert: protectedProcedure
    .input(createUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if profile exists
      const existingProfile = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.session.user.id))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        const result = await ctx.db
          .update(userProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, ctx.session.user.id))
          .returning();

        return result[0];
      }

      // Create new profile
      const newProfile: InsertUserProfile = {
        userId: ctx.session.user.id,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await ctx.db
        .insert(userProfiles)
        .values(newProfile)
        .returning();

      return result[0];
    }),
});
