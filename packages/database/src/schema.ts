// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTableCreator } from "drizzle-orm/pg-core";
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
  website: text("website"),
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

// Export type for TypeScript usage
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
