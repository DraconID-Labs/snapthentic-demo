ALTER TABLE "snapthentic_snaps" RENAME COLUMN "photo_data" TO "photo_url";--> statement-breakpoint
ALTER TABLE "snapthentic_snaps" DROP COLUMN "signed_photo_data";