CREATE TABLE "admin_login_attempts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_login_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ip_hash" text NOT NULL,
	"attempted_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_login_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admin_login_blocks" (
	"ip_hash" text PRIMARY KEY NOT NULL,
	"blocked_until" bigint NOT NULL,
	"level" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_login_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "discount_secrets" (
	"key" text PRIMARY KEY NOT NULL,
	"encrypted_value" text NOT NULL,
	"iv" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discount_secrets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "jummah_schedules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jummah_schedules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"friday_date" text NOT NULL,
	"venue" text NOT NULL,
	"first_adhan" text NOT NULL,
	"first_talk" text,
	"first_khutbah" text NOT NULL,
	"first_salah" text NOT NULL,
	"second_adhan" text NOT NULL,
	"second_khutbah" text NOT NULL,
	"second_salah" text NOT NULL,
	"announcement" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jummah_schedules_friday_date_unique" UNIQUE("friday_date")
);
--> statement-breakpoint
ALTER TABLE "jummah_schedules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_email_hashes" (
	"email_hash" text PRIMARY KEY NOT NULL,
	"encrypted_email" text,
	"email_iv" text,
	"academic_year" text DEFAULT '2026/27' NOT NULL,
	"expires_at" bigint DEFAULT 1817074800000 NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_email_hashes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "otp_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"email_hash" text NOT NULL,
	"ip_hash" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otp_challenges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wallet_membership_passes" (
	"email_hash" text PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"membership_id" text,
	"encrypted_name" text NOT NULL,
	"name_iv" text NOT NULL,
	"academic_year" text DEFAULT '2026/27' NOT NULL,
	"expires_at" bigint DEFAULT 1817074800000 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_membership_passes_object_id_unique" UNIQUE("object_id"),
	CONSTRAINT "wallet_membership_passes_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
ALTER TABLE "wallet_membership_passes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_admin_login_ip_time" ON "admin_login_attempts" USING btree ("ip_hash","attempted_at");--> statement-breakpoint
CREATE INDEX "idx_otp_email_created" ON "otp_challenges" USING btree ("email_hash","created_at");--> statement-breakpoint
CREATE INDEX "idx_otp_ip_created" ON "otp_challenges" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "idx_otp_expires" ON "otp_challenges" USING btree ("expires_at");