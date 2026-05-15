DROP INDEX `care_record_servant_id_idx`;--> statement-breakpoint
CREATE INDEX `care_record_servant_id_cared_at_idx` ON `cat_care_record` (`servant_id`,`cat_id`,`cared_at`);