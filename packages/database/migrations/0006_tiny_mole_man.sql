CREATE TABLE "snapthentic_contest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"entry_price" numeric
);
--> statement-breakpoint
CREATE TABLE "snapthentic_snap_contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snap_id" uuid NOT NULL,
	"contest_id" uuid NOT NULL,
	"active" boolean DEFAULT false,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"entry_price" numeric,
	"prize" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapthentic_snap_contest_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"snap_contest_id" uuid NOT NULL,
	"created_at" timestamp with time zone
);
