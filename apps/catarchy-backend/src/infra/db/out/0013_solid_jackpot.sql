ALTER TABLE `chronicle` ADD `type` text NOT NULL;--> statement-breakpoint
CREATE INDEX `chronicle_type_idx` ON `chronicle` (`type`);--> statement-breakpoint
ALTER TABLE `chronicle` DROP COLUMN `updated_at`;