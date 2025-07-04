// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
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

export const snaps = createTable("snaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  photoData: text("photo_data").notNull(), // Base64 encoded photo data
  signedPhotoData: text("signed_photo_data"), // Base64 encoded photo data with steganography signature
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

export const snapRelations = relations(snaps, ({ one }) => ({
  author: one(userProfiles, {
    fields: [snaps.userId],
    references: [userProfiles.userId],
  }),
}));

// Export type for TypeScript usage
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type Snap = typeof snaps.$inferSelect;
export type InsertSnap = typeof snaps.$inferInsert;
