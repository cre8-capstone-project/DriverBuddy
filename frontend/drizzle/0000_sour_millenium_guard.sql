CREATE TABLE `Alert` (
	`alertId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`faceDetectionSessionId` text NOT NULL,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `FaceDetectionSession` (
	`faceDetectionSessionId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`startTime` text,
	`endTime` text,
	`sessionDuration` integer GENERATED ALWAYS AS (strftime('%s', endTime) - strftime('%s', startTime)) VIRTUAL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dark` integer NOT NULL
);
