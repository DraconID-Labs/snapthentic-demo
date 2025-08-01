import { randomUUID } from "node:crypto";
import {
  type InsertSnap,
  snaps,
  userProfiles,
  contest,
  snapContest,
  snapContestVote,
} from "@snapthentic/database/schema";
import {
  constructV1Signature,
  parseV1Signature,
  verifyV1Signature,
} from "@snapthentic/signatures";
import {
  decodeMessage,
  encodeMessage,
  imageToBuffer,
} from "@snapthentic/stenography";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { registerSnapOnChain } from "~/blockchain/register-snap-onchain";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getPublicUrl } from "~/supabase/get-public-url";
import { uploadToSupabase } from "~/supabase/upload";

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
  contestId: z.string().optional(),
});

const UpdateSnapSchema = z.object({
  snapId: z.string().min(1, "Snap ID is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const snapsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateSnapSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, ctx.session.user.id),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const hexHash = ensureHexPrefix(input.hash);
      const hexSignature = ensureHexPrefix(input.signature);
      const hexSignerAddress = ensureHexPrefix(input.signerAddress);

      const isSignatureValid = await verifyV1Signature({
        signerAddress: hexSignerAddress,
        hash: hexHash,
        signature: hexSignature,
      });

      if (!isSignatureValid) {
        throw new Error("Invalid signature");
      }

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

      // If contestId is provided, enter the snap into the contest
      if (input.contestId && insertedSnap) {
        // Verify contest exists and is active
        const contestData = await ctx.db.query.contest.findFirst({
          where: eq(contest.id, input.contestId),
        });

        if (!contestData) {
          throw new Error("Contest not found");
        }

        if (!contestData.active) {
          throw new Error("Contest is not active");
        }

        // Check if contest is within entry period
        const now = new Date();
        if (contestData.startDate && now < contestData.startDate) {
          throw new Error("Contest entry period hasn't started yet");
        }

        if (contestData.endDate && now > contestData.endDate) {
          throw new Error("Contest entry period has ended");
        }

        // Only new snaps can be entered (created after contest start)
        if (
          contestData.startDate &&
          insertedSnap.createdAt < contestData.startDate
        ) {
          throw new Error(
            "Only new snaps created after the contest started can be entered",
          );
        }

        // Check if user has already entered this contest
        const existingEntry = await ctx.db.query.snapContest.findFirst({
          where: eq(snapContest.contestId, input.contestId),
          with: {
            snap: {
              columns: {
                userId: true,
              },
            },
          },
        });

        if (
          existingEntry &&
          existingEntry.snap.userId === ctx.session.user.id
        ) {
          throw new Error("You have already entered this contest");
        }

        // Create contest entry (active by default since we're ignoring payment for now)
        const contestEntry = {
          snapId: insertedSnap.id,
          contestId: input.contestId,
          active: true, // Skip payment for now
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await ctx.db.insert(snapContest).values(contestEntry);
      }

      return {
        id: insertedSnap?.id,
        createdAt: insertedSnap?.createdAt,
        contestId: input.contestId,
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

      const isSignatureValid = await verifyV1Signature({
        signerAddress: payload.signerAddress,
        hash: payload.hash,
        signature: payload.signature,
      });

      if (!isSignatureValid) {
        throw new Error("Invalid signature");
      }

      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.hash, payload.hash),
      });

      // TODO IN THE FUTURE
      // Strip data, re-hash image, verify signature against new hash based on the address
      return {
        onchain: payload,
        system: {
          snapId: snap?.id,
          author: snap?.userId,
          createdAt: snap?.createdAt,
          txHash: snap?.txHash,
          hash: snap?.hash,
          signature: snap?.signature,
          signerAddress: snap?.signerAddress,
          signatureVersion: snap?.signatureVersion,
          title: snap?.title,
        },
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

  delete: protectedProcedure
    .input(z.object({ snapId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.id, input.snapId),
      });
      // TODO: add removal from bucket ;p

      if (!snap) {
        throw new Error("Snap not found");
      }

      const isOwner = snap.userId === ctx.session.user.id;

      if (!isOwner) {
        throw new Error("You are not the owner of this snap");
      }

      // First, find any contest entries associated with this snap
      const contestEntries = await ctx.db.query.snapContest.findMany({
        where: eq(snapContest.snapId, input.snapId),
      });

      // Delete all votes for these contest entries
      if (contestEntries.length > 0) {
        for (const entry of contestEntries) {
          await ctx.db
            .delete(snapContestVote)
            .where(eq(snapContestVote.snapContestId, entry.id));
        }
      }

      // Then delete the contest entries
      await ctx.db
        .delete(snapContest)
        .where(eq(snapContest.snapId, input.snapId));

      // Finally delete the snap itself
      await ctx.db.delete(snaps).where(eq(snaps.id, input.snapId));

      return {
        success: true,
      };
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
          likes: {
            columns: {
              id: true,
              userId: true,
            },
          },
          contestEntry: {
            with: {
              contest: {
                columns: {
                  id: true,
                  title: true,
                  active: true,
                  prize: true,
                },
              },
              votes: true,
            },
          },
        },
      });

      const hasMore = feed.length > limit;
      const items = hasMore ? feed.slice(0, limit) : feed;

      // Add like counts, user's like status, and contest information
      const enrichedItems = items.map((snap) => ({
        ...snap,
        likeCount: snap.likes.length,
        isLikedByUser: ctx.session?.user
          ? snap.likes.some((like) => like.userId === ctx.session?.user.id)
          : false,
        // Contest information
        contestEntry: snap.contestEntry
          ? {
              ...snap.contestEntry,
              voteCount: snap.contestEntry.votes.length,
              votes: undefined, // Remove votes array to save bandwidth
            }
          : null,
        // Remove the likes array to avoid sending unnecessary data
        likes: undefined,
      }));

      return {
        items: enrichedItems,
        nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
        hasMore,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ snapId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Assert session exists (guaranteed in protectedProcedure)
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session required",
        });
      }

      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.id, input.snapId),
        with: {
          author: true,
          likes: {
            columns: {
              id: true,
              userId: true,
            },
          },
          contestEntry: {
            with: {
              contest: {
                columns: {
                  id: true,
                  title: true,
                  active: true,
                  prize: true,
                },
              },
              votes: true,
            },
          },
        },
      });

      if (!snap) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Snap not found",
        });
      }

      return {
        ...snap,
        likeCount: snap.likes.length,
        isLikedByUser: snap.likes.some(
          (like) => like.userId === ctx.session.user.id,
        ),
        // Contest information
        contestEntry: snap.contestEntry
          ? {
              ...snap.contestEntry,
              voteCount: snap.contestEntry.votes.length,
              votes: undefined, // Remove votes array to save bandwidth
            }
          : null,
        // Remove the likes array to avoid sending unnecessary data
        likes: undefined,
      };
    }),

  update: protectedProcedure
    .input(UpdateSnapSchema)
    .mutation(async ({ ctx, input }) => {
      // First, verify the snap exists and the user owns it
      const snap = await ctx.db.query.snaps.findFirst({
        where: eq(snaps.id, input.snapId),
      });

      if (!snap) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Snap not found",
        });
      }

      if (snap.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own snaps",
        });
      }

      // Update the snap with new details
      const [updatedSnap] = await ctx.db
        .update(snaps)
        .set({
          title: input.title,
          description: input.description,
          isPublic: input.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(snaps.id, input.snapId))
        .returning();

      return updatedSnap;
    }),
});

const ensureHexPrefix = (input: string) => {
  if (input.startsWith("0x")) {
    return input;
  }

  return `0x${input}`;
};
