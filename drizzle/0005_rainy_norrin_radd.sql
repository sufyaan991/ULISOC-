CREATE TABLE `admin_login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_hash` text NOT NULL,
	`attempted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_login_ip_time` ON `admin_login_attempts` (`ip_hash`,`attempted_at`);--> statement-breakpoint
CREATE TABLE `admin_login_blocks` (
	`ip_hash` text PRIMARY KEY NOT NULL,
	`blocked_until` integer NOT NULL,
	`level` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `wallet_membership_passes` ADD `membership_id` text;--> statement-breakpoint
ALTER TABLE `wallet_membership_passes` ADD `academic_year` text DEFAULT '2026/27' NOT NULL;--> statement-breakpoint
ALTER TABLE `wallet_membership_passes` ADD `expires_at` integer DEFAULT 1817074800000 NOT NULL;--> statement-breakpoint
ALTER TABLE `wallet_membership_passes` ADD `status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_membership_passes_membership_id_unique` ON `wallet_membership_passes` (`membership_id`);