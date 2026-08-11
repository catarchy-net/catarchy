PRAGMA defer_foreign_keys = on;
CREATE TABLE `__new_auth` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`email` text,
	`password` text,
	`wallet_address` text,
	`remilia_username` text,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "email_password_required" CHECK("__new_auth"."provider" != 'email_password' OR ("__new_auth"."email" IS NOT NULL AND "__new_auth"."password" IS NOT NULL)),
	CONSTRAINT "wallet_required" CHECK("__new_auth"."provider" != 'wallet' OR "__new_auth"."wallet_address" IS NOT NULL),
	CONSTRAINT "remilianet_required" CHECK("__new_auth"."provider" != 'remilianet' OR "__new_auth"."remilia_username" IS NOT NULL)
);
INSERT INTO `__new_auth`("id", "provider", "email", "password", "wallet_address", "remilia_username", "user_id", "created_at", "updated_at") SELECT "id", "provider", "email", "password", "wallet_address", NULL, "user_id", "created_at", "updated_at" FROM `auth`;
DROP TABLE `auth`;
ALTER TABLE `__new_auth` RENAME TO `auth`;
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_email_unique` ON `auth` (`email`);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_wallet_address_unique` ON `auth` (`wallet_address`);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_remilia_username_unique` ON `auth` (`remilia_username`);
