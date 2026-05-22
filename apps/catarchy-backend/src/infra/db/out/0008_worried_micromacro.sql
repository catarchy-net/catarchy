DROP TABLE `personality_test_answer`;
PRAGMA defer_foreign_keys = on;
CREATE TABLE `__new_cat_personality` (
	`cat_id` text PRIMARY KEY NOT NULL,
	`openness` integer DEFAULT 0 NOT NULL,
	`conscientiousness` integer DEFAULT 0 NOT NULL,
	`extraversion` integer DEFAULT 0 NOT NULL,
	`agreeableness` integer DEFAULT 0 NOT NULL,
	`neuroticism` integer DEFAULT 0 NOT NULL,
	`remaining_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`cat_id`) REFERENCES `cat`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO `__new_cat_personality`("cat_id", "openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "remaining_count", "created_at", "updated_at") SELECT "cat_id", "openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "remaining_count", "created_at", "updated_at" FROM `cat_personality`;
DROP TABLE `cat_personality`;
ALTER TABLE `__new_cat_personality` RENAME TO `cat_personality`;
