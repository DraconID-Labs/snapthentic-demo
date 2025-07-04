CREATE TABLE "snapthentic_user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"nickname" varchar(50),
	"display_name" varchar(100),
	"avatar_url" text,
	"bio" text,
	"location" varchar(100),
	"website" text,
	"twitter_handle" varchar(50),
	"instagram_handle" varchar(50),
	"is_public" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapthentic_user_profile_user_id_unique" UNIQUE("user_id")
);
