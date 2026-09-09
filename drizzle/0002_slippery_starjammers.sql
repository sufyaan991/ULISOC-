CREATE INDEX `idx_otp_email_created` ON `otp_challenges` (`email_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_otp_ip_created` ON `otp_challenges` (`ip_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_otp_expires` ON `otp_challenges` (`expires_at`);