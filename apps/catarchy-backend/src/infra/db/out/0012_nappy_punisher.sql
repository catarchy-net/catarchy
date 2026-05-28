DROP INDEX `cat_relationship_history_cat_id_idx`;--> statement-breakpoint
CREATE INDEX `cat_relationship_history_initiator_cursor_idx` ON `cat_relationship_history` (`cat_id`,`id`);