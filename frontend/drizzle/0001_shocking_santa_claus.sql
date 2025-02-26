CREATE TABLE `Stops` (
	`stopId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`journeyId` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`address` text NOT NULL,
	`name` text NOT NULL,
	`priceLevel` integer,
	`rating` integer,
	`isOrigin` integer,
	`isDestination` integer
);
