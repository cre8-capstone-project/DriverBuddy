CREATE TABLE `restStopTypes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`settingsId` integer NOT NULL,
	`stopType` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`settingsId`) REFERENCES `settings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `restStopRadius` integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `restStopCount` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `alertMsgAndSound` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` DROP COLUMN `dark`;