PRAGMA defer_foreign_keys = on;
CREATE TABLE `__new_personality_test_answer` (
	`cat_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer` integer NOT NULL,
	PRIMARY KEY(`cat_id`, `question_id`),
	FOREIGN KEY (`cat_id`) REFERENCES `cat`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `personality_question`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "answer_range" CHECK("__new_personality_test_answer"."answer" >= 1 AND "__new_personality_test_answer"."answer" <= 5)
);
INSERT INTO `__new_personality_test_answer`("cat_id", "question_id", "answer") SELECT "cat_id", "question_id", "answer" FROM `personality_test_answer`;
DROP TABLE `personality_test_answer`;
ALTER TABLE `__new_personality_test_answer` RENAME TO `personality_test_answer`;
--> statement-breakpoint
CREATE INDEX `personality_test_answer_cat_id_idx` ON `personality_test_answer` (`cat_id`);
