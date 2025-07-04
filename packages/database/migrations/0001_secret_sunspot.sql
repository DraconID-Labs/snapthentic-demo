CREATE TABLE "snapthentic_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"proof" text NOT NULL,
	"action" varchar(255) NOT NULL,
	"signal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapthentic_proofs_user_id_unique" UNIQUE("user_id")
);
