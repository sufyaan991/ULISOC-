CREATE TABLE `wallet_membership_passes` (
	`email_hash` text PRIMARY KEY NOT NULL,
	`object_id` text NOT NULL,
	`encrypted_name` text NOT NULL,
	`name_iv` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_membership_passes_object_id_unique` ON `wallet_membership_passes` (`object_id`);