-- The committee's members table may already exist in Supabase; keep its data and policies.
CREATE TABLE IF NOT EXISTS "members" (
	"email" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;