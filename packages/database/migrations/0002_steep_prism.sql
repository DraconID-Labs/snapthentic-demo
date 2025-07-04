CREATE TABLE "snapthentic_snaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"photo_data" text NOT NULL,
	"hash" text NOT NULL,
	"signature" text NOT NULL,
	"signer_address" varchar(255) NOT NULL,
	"signature_version" varchar(10) NOT NULL,
	"title" varchar(255),
	"description" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
