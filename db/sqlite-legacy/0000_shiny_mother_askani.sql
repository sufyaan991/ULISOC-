CREATE TABLE `jummah_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`friday_date` text NOT NULL,
	`venue` text NOT NULL,
	`first_adhan` text NOT NULL,
	`first_talk` text,
	`first_khutbah` text NOT NULL,
	`first_salah` text NOT NULL,
	`second_adhan` text NOT NULL,
	`second_khutbah` text NOT NULL,
	`second_salah` text NOT NULL,
	`announcement` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jummah_schedules_friday_date_unique` ON `jummah_schedules` (`friday_date`);