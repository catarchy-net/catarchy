PRAGMA defer_foreign_keys = on;
CREATE TABLE `__new_cat_care_record` (
	`id` text PRIMARY KEY NOT NULL,
	`cat_id` text NOT NULL,
	`servant_id` text NOT NULL,
	`growth_delta` integer NOT NULL,
	`emotion_delta` integer NOT NULL,
	`message` text,
	`cared_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cat_id`) REFERENCES `cat`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`servant_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO `__new_cat_care_record`("id", "cat_id", "servant_id", "growth_delta", "emotion_delta", "message", "cared_at") SELECT "id", "cat_id", "servant_id", "growth_delta", "emotion_delta", "message", "cared_at" FROM `cat_care_record`;
DROP TABLE `cat_care_record`;
ALTER TABLE `__new_cat_care_record` RENAME TO `cat_care_record`;
--> statement-breakpoint
CREATE INDEX `care_record_cat_id_idx` ON `cat_care_record` (`cat_id`);
--> statement-breakpoint
CREATE INDEX `care_record_servant_id_idx` ON `cat_care_record` (`servant_id`);
