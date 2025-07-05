import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
    contest,
    snapContest,
    snapContestVote,
    snaps, type InsertSnapContestVote
} from "@snapthentic/database/schema";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const contestsRouter = createTRPCRouter({
  // Get all active contests
  getActive: publicProcedure.query(async ({ ctx }) => {
    const activeContests = await ctx.db.query.contest.findMany({
      where: eq(contest.active, true),
      orderBy: [desc(contest.startDate)],
    });
    return activeContests;
  }),

  // Get contest by ID with entries and votes
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contestData = await ctx.db.query.contest.findFirst({
        where: eq(contest.id, input.id),
        with: {
          snapContests: {
            with: {
              snap: {
                with: {
                  author: true,
                  likes: true,
                },
              },
              votes: {
                with: {
                  voter: true,
                },
              },
            },
          },
        },
      });

      if (!contestData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contest not found",
        });
      }

      return contestData;
    }),

  // Get contest entries with voting information
  getEntries: publicProcedure
    .input(z.object({ contestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.query.snapContest.findMany({
        where: eq(snapContest.contestId, input.contestId),
        with: {
          snap: {
            with: {
              author: true,
              likes: true,
            },
          },
          votes: {
            with: {
              voter: true,
            },
          },
        },
        orderBy: [desc(snapContest.createdAt)],
      });

      return entries;
    }),

  // Get user's contest entries
  getMyEntries: protectedProcedure
    .input(z.object({ contestId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.query.snapContest.findMany({
        where: input.contestId
          ? and(
              eq(snapContest.contestId, input.contestId),
              eq(snaps.userId, ctx.session.user.id)
            )
          : undefined,
        with: {
          snap: {
            with: {
              author: true,
            },
          },
          contest: true,
          votes: true,
        },
        orderBy: [desc(snapContest.createdAt)],
      });

      // Filter entries to only include user's snaps
      const userEntries = entries.filter(entry => entry.snap.userId === ctx.session.user.id);

      return userEntries.map(entry => ({
        ...entry,
        voteCount: entry.votes.length,
      }));
    }),

  // Vote for a contest entry
  vote: protectedProcedure
    .input(z.object({ snapContestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already voted for this entry
      const existingVote = await ctx.db.query.snapContestVote.findFirst({
        where: and(
          eq(snapContestVote.userId, ctx.session.user.id),
          eq(snapContestVote.snapContestId, input.snapContestId),
        ),
      });

      if (existingVote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already voted for this entry",
        });
      }

      // Get the contest entry to check if contest is active
      const contestEntry = await ctx.db.query.snapContest.findFirst({
        where: eq(snapContest.id, input.snapContestId),
        with: {
          contest: true,
        },
      });

      if (!contestEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contest entry not found",
        });
      }

      if (!contestEntry.contest.active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contest is not active",
        });
      }

      // Check if contest has ended
      if (contestEntry.contest.endDate && new Date() > contestEntry.contest.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contest has ended",
        });
      }

      const newVote: InsertSnapContestVote = {
        userId: ctx.session.user.id,
        snapContestId: input.snapContestId,
        createdAt: new Date(),
      };

      const [insertedVote] = await ctx.db
        .insert(snapContestVote)
        .values(newVote)
        .returning();

      return insertedVote;
    }),

  // Remove vote for a contest entry
  removeVote: protectedProcedure
    .input(z.object({ snapContestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.query.snapContestVote.findFirst({
        where: and(
          eq(snapContestVote.userId, ctx.session.user.id),
          eq(snapContestVote.snapContestId, input.snapContestId),
        ),
      });

      if (!existingVote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vote not found",
        });
      }

      await ctx.db
        .delete(snapContestVote)
        .where(eq(snapContestVote.id, existingVote.id));

      return { success: true };
    }),

  // Get vote status for entries (for current user)
  getVoteStatus: protectedProcedure
    .input(z.object({ snapContestIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      if (input.snapContestIds.length === 0) {
        return {};
      }

      const votes = await ctx.db.query.snapContestVote.findMany({
        where: and(
          eq(snapContestVote.userId, ctx.session.user.id),
          inArray(snapContestVote.snapContestId, input.snapContestIds),
        ),
      });

      return votes.reduce((acc, vote) => {
        acc[vote.snapContestId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }),
}); 