import { follows, userProfiles } from "@snapthentic/database/schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const followsRouter = createTRPCRouter({
  // Toggle follow on a user (follow if not followed, unfollow if already followed)
  toggle: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent self-following
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      // Check if the user exists
      const userToFollow = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      });

      if (!userToFollow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if already following
      const existingFollow = await ctx.db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.user.id),
          eq(follows.followingId, input.userId)
        ),
      });

      if (existingFollow) {
        // Unfollow: Remove the follow
        await ctx.db
          .delete(follows)
          .where(
            and(
              eq(follows.followerId, ctx.session.user.id),
              eq(follows.followingId, input.userId)
            )
          );

        return {
          action: "unfollowed" as const,
          following: false,
        };
      } else {
        // Follow: Add the follow
        await ctx.db.insert(follows).values({
          followerId: ctx.session.user.id,
          followingId: input.userId,
        });

        return {
          action: "followed" as const,
          following: true,
        };
      }
    }),

  // Check if current user is following another user
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await ctx.db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.user.id),
          eq(follows.followingId, input.userId)
        ),
      });

      return {
        following: !!follow,
        followedAt: follow?.createdAt,
      };
    }),

  // Get followers of a user
  getFollowers: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userFollowers = await ctx.db.query.follows.findMany({
        where: eq(follows.followingId, input.userId),
        with: {
          follower: true,
        },
        orderBy: (follows, { desc }) => desc(follows.createdAt),
        limit: input.limit + 1,
      });

      const hasMore = userFollowers.length > input.limit;
      const items = hasMore ? userFollowers.slice(0, input.limit) : userFollowers;

      return {
        items: items.map((follow) => ({
          id: follow.id,
          createdAt: follow.createdAt,
          user: follow.follower,
        })),
        hasMore,
        nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
      };
    }),

  // Get users that a user is following
  getFollowing: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user exists
      const user = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userFollowing = await ctx.db.query.follows.findMany({
        where: eq(follows.followerId, input.userId),
        with: {
          following: true,
        },
        orderBy: (follows, { desc }) => desc(follows.createdAt),
        limit: input.limit + 1,
      });

      const hasMore = userFollowing.length > input.limit;
      const items = hasMore ? userFollowing.slice(0, input.limit) : userFollowing;

      return {
        items: items.map((follow) => ({
          id: follow.id,
          createdAt: follow.createdAt,
          user: follow.following,
        })),
        hasMore,
        nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
      };
    }),

  // Get follower and following counts for a user
  getCounts: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
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
        followers: followersResult[0]?.count ?? 0,
        following: followingResult[0]?.count ?? 0,
      };
    }),
}); 