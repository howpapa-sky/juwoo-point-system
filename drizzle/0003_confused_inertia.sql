CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`category` enum('points','learning','streak','special') NOT NULL,
	`requirement` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `english_words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(100) NOT NULL,
	`korean` varchar(100) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`category` varchar(50) NOT NULL,
	`example_sentence` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `english_words_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`juwoo_id` int NOT NULL DEFAULT 1,
	`badge_id` int NOT NULL,
	`earned_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `word_learning_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`juwoo_id` int NOT NULL DEFAULT 1,
	`word_id` int NOT NULL,
	`status` enum('learning','mastered') NOT NULL DEFAULT 'learning',
	`correct_count` int NOT NULL DEFAULT 0,
	`incorrect_count` int NOT NULL DEFAULT 0,
	`last_practiced_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `word_learning_progress_id` PRIMARY KEY(`id`)
);
