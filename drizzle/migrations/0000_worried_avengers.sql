CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`provider` text,
	`provider_account_id` text,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	`refresh_token_expires_in` integer,
	`password` text
);
--> statement-breakpoint
CREATE TABLE `comment_votes` (
	`user_id` integer NOT NULL,
	`comment_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `comment_id`)
);
--> statement-breakpoint
CREATE INDEX `comment_votes_user_idx` ON `comment_votes` (`user_id`);--> statement-breakpoint
CREATE INDEX `comment_votes_comment_idx` ON `comment_votes` (`comment_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`author_id` integer NOT NULL,
	`discussion_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comment_author_idx` ON `comments` (`author_id`);--> statement-breakpoint
CREATE INDEX `comment_discussion_idx` ON `comments` (`discussion_id`);--> statement-breakpoint
CREATE TABLE `discussion_votes` (
	`user_id` integer NOT NULL,
	`discussion_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `discussion_id`)
);
--> statement-breakpoint
CREATE INDEX `discussion_votes_user_idx` ON `discussion_votes` (`user_id`);--> statement-breakpoint
CREATE INDEX `discussion_votes_discussion_idx` ON `discussion_votes` (`discussion_id`);--> statement-breakpoint
CREATE TABLE `discussions` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`author_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `discussion_author_idx` ON `discussions` (`author_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`session_token` text NOT NULL,
	`user_id` integer NOT NULL,
	`expires` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`email_verified` text,
	`image` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `identifier_token_idx` ON `verification_tokens` (`identifier`,`token`);