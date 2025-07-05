import { likes, snaps } from "@snapthentic/database/schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const likesRouter = createTRPCRouter({
  // Toggle like on a snap (like if not liked, unlike if already liked)
  toggle: protectedProcedure
    .input(z.object({ snapId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if the snap exists
      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.id, input.snapId),
      });

      if (!snap) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Snap not found",
        });
      }

      // Check if user already liked this snap
      const existingLike = await ctx.db.query.likes.findFirst({
        where: and(
          eq(likes.userId, ctx.session.user.id),
          eq(likes.snapId, input.snapId),
        ),
      });

      if (existingLike) {
        // Unlike: Remove the like
        await ctx.db
          .delete(likes)
          .where(
            and(
              eq(likes.userId, ctx.session.user.id),
              eq(likes.snapId, input.snapId),
            ),
          );

        return {
          action: "unliked" as const,
          liked: false,
        };
      } else {
        // Like: Add the like
        await ctx.db.insert(likes).values({
          userId: ctx.session.user.id,
          snapId: input.snapId,
        });

        return {
          action: "liked" as const,
          liked: true,
        };
      }
    }),

  // Get like count for a snap
  getCount: publicProcedure
    .input(z.object({ snapId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.snapId, input.snapId));

      return result?.count ?? 0;
    }),

  // Check if current user liked a snap
  getUserLike: protectedProcedure
    .input(z.object({ snapId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.query.likes.findFirst({
        where: and(
          eq(likes.userId, ctx.session.user.id),
          eq(likes.snapId, input.snapId),
        ),
      });

      return {
        liked: !!like,
        likedAt: like?.createdAt,
      };
    }),

  // Get users who liked a snap
  getSnapLikes: publicProcedure
    .input(
      z.object({
        snapId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.id, input.snapId),
      });

      if (!snap) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Snap not found",
        });
      }

      const snapLikes = await ctx.db.query.likes.findMany({
        where: eq(likes.snapId, input.snapId),
        with: {
          user: true,
        },
        orderBy: (likes, { desc }) => desc(likes.createdAt),
        limit: input.limit + 1,
        // Note: cursor pagination would need additional logic
      });

      const hasMore = snapLikes.length > input.limit;
      const items = hasMore ? snapLikes.slice(0, input.limit) : snapLikes;

      return {
        items: items.map((like) => ({
          id: like.id,
          createdAt: like.createdAt,
          user: like.user,
        })),
        hasMore,
        nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
      };
    }),

  // Get likes for multiple snaps (for feed optimization)
  getBatchLikes: publicProcedure
    .input(z.object({ snapIds: z.array(z.string().uuid()).max(50) }))
    .query(async ({ ctx, input }) => {
      if (input.snapIds.length === 0) {
        return {};
      }

      const likeCounts = await ctx.db
        .select({
          snapId: likes.snapId,
          count: count(),
        })
        .from(likes)
        .where(
          input.snapIds.length === 1
            ? eq(likes.snapId, input.snapIds[0]!)
            : inArray(likes.snapId, input.snapIds),
        )
        .groupBy(likes.snapId);

      // Convert to object for easy lookup
      return likeCounts.reduce(
        (acc, { snapId, count }) => {
          acc[snapId] = count;
          return acc;
        },
        {} as Record<string, number>,
      );
    }),

  // Get user's like status for multiple snaps (for authenticated users)
  getBatchUserLikes: protectedProcedure
    .input(z.object({ snapIds: z.array(z.string().uuid()).max(50) }))
    .query(async ({ ctx, input }) => {
      if (input.snapIds.length === 0) {
        return {};
      }

      const userLikes = await ctx.db.query.likes.findMany({
        where: and(
          eq(likes.userId, ctx.session.user.id),
          input.snapIds.length === 1
            ? eq(likes.snapId, input.snapIds[0]!)
            : inArray(likes.snapId, input.snapIds),
        ),
      });

      // Convert to object for easy lookup
      return userLikes.reduce(
        (acc, like) => {
          acc[like.snapId] = {
            liked: true,
            likedAt: like.createdAt,
          };
          return acc;
        },
        {} as Record<string, { liked: boolean; likedAt: Date }>,
      );
    }),
});
