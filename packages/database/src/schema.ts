// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import { numeric, pgTableCreator } from "drizzle-orm/pg-core";
import { boolean, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `snapthentic_${name}`);

export const userProfiles = createTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(), // Reference to NextAuth user ID
  nickname: varchar("nickname", { length: 50 }),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  twitterHandle: varchar("twitter_handle", { length: 50 }),
  instagramHandle: varchar("instagram_handle", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const proofs = createTable("proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  proof: text("proof").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  signal: text("signal"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const snaps = createTable("snaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  txHash: text("tx_hash").notNull().default(""), // Transaction hash of the snap
  photoUrl: text("photo_url").notNull(), // URL of the photo
  hash: text("hash").notNull(), // Hash of the photo
  signature: text("signature").notNull(), // Digital signature
  signerAddress: varchar("signer_address", { length: 255 }).notNull(), // Address of the signer
  signatureVersion: varchar("signature_version", { length: 10 }).notNull(), // Version of the signature
  title: varchar("title", { length: 255 }), // Optional title for the snap
  description: text("description"), // Optional description
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const snapContest = createTable("snap_contests", {
  id: uuid("id").defaultRandom().primaryKey(),
  snapId: uuid("snap_id").notNull(),
  contestId: uuid("contest_id").notNull(),
  // Has entry fee been paid?
  active: boolean("active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const snapContestVote = createTable("snap_contest_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  snapContestId: uuid("snap_contest_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

export const contest = createTable("contest", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  active: boolean("active").default(false),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  entryPrice: numeric("entry_price"),
  prize: numeric("prize"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contestRelations = relations(contest, ({ many }) => ({
  snapContests: many(snapContest),
}));

export const snapContestVoteRelations = relations(
  snapContestVote,
  ({ one }) => ({
    snapContest: one(snapContest, {
      fields: [snapContestVote.snapContestId],
      references: [snapContest.id],
    }),
    voter: one(userProfiles, {
      fields: [snapContestVote.userId],
      references: [userProfiles.userId],
    }),
  }),
);

export const snapRelations = relations(snaps, ({ one }) => ({
  author: one(userProfiles, {
    fields: [snaps.userId],
    references: [userProfiles.userId],
  }),
  contestEntry: one(snapContest),
}));

export const snapContestRelations = relations(snapContest, ({ one, many }) => ({
  snap: one(snaps, {
    fields: [snapContest.snapId],
    references: [snaps.id],
  }),
  contest: one(contest, {
    fields: [snapContest.contestId],
    references: [contest.id],
  }),
  votes: many(snapContestVote),
}));

// Export type for TypeScript usage
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type Snap = typeof snaps.$inferSelect;
export type InsertSnap = typeof snaps.$inferInsert;

export type SnapWithAuthor = typeof snaps.$inferSelect & {
  author: UserProfile;
};

export type Contest = typeof contest.$inferSelect;
export type InsertContest = typeof contest.$inferInsert;

export type SnapContest = typeof snapContest.$inferSelect;
export type InsertSnapContest = typeof snapContest.$inferInsert;

export type SnapContestVote = typeof snapContestVote.$inferSelect;
export type InsertSnapContestVote = typeof snapContestVote.$inferInsert;

export type ContestWithSnapContests = Contest & {
  snapContests: SnapContest &
    {
      snap: Snap;
      votes: SnapContestVote[];
    }[];
};
