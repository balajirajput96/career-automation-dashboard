CREATE TABLE `automation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runTime` timestamp NOT NULL DEFAULT (now()),
	`status` enum('Success','Failed','Running') NOT NULL DEFAULT 'Success',
	`jobsFound` int NOT NULL DEFAULT 0,
	`details` text,
	`errorMessage` text,
	`scheduleCronTaskUid` varchar(65),
	CONSTRAINT `automation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`track` enum('Pharmaceutical','AI & Python') NOT NULL,
	`remoteEligibility` varchar(100) NOT NULL,
	`jobUrl` text NOT NULL,
	`description` text NOT NULL,
	`matchScore` float NOT NULL DEFAULT 0,
	`matchExplanation` text,
	`status` enum('Discovered','Applied','Interview','Offer','Rejected') NOT NULL DEFAULT 'Discovered',
	`appliedAt` timestamp,
	`notes` text,
	`discoveredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL DEFAULT 'Balaji Dilip Singh Rajput',
	`headline` text,
	`summary` text,
	`skills` text,
	`experienceSummary` text,
	`targetTracks` text,
	`matchThreshold` float NOT NULL DEFAULT 75,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
