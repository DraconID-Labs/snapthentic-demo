ALTER TABLE "snapthentic_contest" ADD COLUMN "active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "prize" numeric;--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "snapthentic_contest" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "snapthentic_snap_contests" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "snapthentic_snap_contests" DROP COLUMN "end_date";--> statement-breakpoint
ALTER TABLE "snapthentic_snap_contests" DROP COLUMN "entry_price";--> statement-breakpoint
ALTER TABLE "snapthentic_snap_contests" DROP COLUMN "prize";