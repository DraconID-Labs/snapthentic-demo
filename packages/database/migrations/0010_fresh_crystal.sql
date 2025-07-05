CREATE TABLE "snapthentic_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" varchar(255) NOT NULL,
	"following_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapthentic_follows_follower_id_following_id_unique" UNIQUE("follower_id","following_id"),
	CONSTRAINT "no_self_follow" CHECK ("snapthentic_follows"."follower_id" != "snapthentic_follows"."following_id")
);
--> statement-breakpoint
CREATE TABLE "snapthentic_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"snap_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapthentic_likes_user_id_snap_id_unique" UNIQUE("user_id","snap_id")
);
--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "snapthentic_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "snapthentic_follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "likes_user_id_idx" ON "snapthentic_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "likes_snap_id_idx" ON "snapthentic_likes" USING btree ("snap_id");