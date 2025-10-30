CREATE TABLE `juwoo_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT '주우',
	`current_points` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `juwoo_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `point_transactions` RENAME COLUMN `user_id` TO `juwoo_id`;--> statement-breakpoint
ALTER TABLE `purchases` RENAME COLUMN `user_id` TO `juwoo_id`;--> statement-breakpoint
ALTER TABLE `point_transactions` MODIFY COLUMN `juwoo_id` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `purchases` MODIFY COLUMN `juwoo_id` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `goals` ADD `juwoo_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `user_id`;