DROP TABLE "member_email_hashes" CASCADE;--> statement-breakpoint
DROP TABLE "otp_challenges" CASCADE;--> statement-breakpoint
ALTER TABLE "wallet_membership_passes" ADD COLUMN "member_email" text;