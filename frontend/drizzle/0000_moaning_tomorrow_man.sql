CREATE TABLE `Alert` (
	`alertId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`faceDetectionSessionId` text NOT NULL,
	`timestamp` text NOT NULL,
	`alertMonth` text GENERATED ALWAYS AS (substr(timestamp, 1, 7)) VIRTUAL,
	`alertDate` text GENERATED ALWAYS AS (substr(timestamp, 1, 10)) VIRTUAL
);
--> statement-breakpoint
CREATE TABLE `FaceDetectionSession` (
	`faceDetectionSessionId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`startTime` text,
	`endTime` text,
	`sessionDuration` integer GENERATED ALWAYS AS (strftime('%s', endTime) - strftime('%s', startTime)) VIRTUAL,
	`sessionStartMonth` text GENERATED ALWAYS AS (substr(startTime, 1, 7)) VIRTUAL,
	`sessionStartDate` text GENERATED ALWAYS AS (substr(startTime, 1, 10)) VIRTUAL,
	`sessionEndMonth` text GENERATED ALWAYS AS (substr(endTime, 1, 7)) VIRTUAL,
	`sessionEndDate` text GENERATED ALWAYS AS (substr(endTime, 1, 10)) VIRTUAL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dark` integer NOT NULL
);
