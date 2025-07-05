ALTER TABLE "snapthentic_contest" RENAME COLUMN "user_id" TO "title";--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "description" varchar(255) NOT NULL;