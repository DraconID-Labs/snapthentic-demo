import {
  type InsertUserProfile,
  userProfiles,
} from "@snapthentic/database/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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

const updateUserProfileSchema = createUserProfileSchema.partial();

export const userProfileRouter = createTRPCRouter({
  // Get current user's profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, ctx.session.user.id))
      .limit(1);

    return profile[0] ?? null;
  }),

  // Get any user's profile by user ID (only if public)
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, input.userId))
        .limit(1);

      const userProfile = profile[0];

      if (!userProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      // Return full profile if it's public, or if it's the current user's profile
      if (userProfile.isPublic || ctx.session?.user?.id === input.userId) {
        return userProfile;
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This profile is private",
      });
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
