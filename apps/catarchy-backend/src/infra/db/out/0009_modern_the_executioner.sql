CREATE TABLE `cat_relationship_history` (
	`id` text PRIMARY KEY NOT NULL,
	`cat_id` text NOT NULL,
	`target_cat_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cat_id`) REFERENCES `cat`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_cat_id`) REFERENCES `cat`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cat_relationship_history_cat_id_idx` ON `cat_relationship_history` (`cat_id`);--> statement-breakpoint
CREATE INDEX `cat_relationship_history_target_cursor_idx` ON `cat_relationship_history` (`target_cat_id`,`id`);