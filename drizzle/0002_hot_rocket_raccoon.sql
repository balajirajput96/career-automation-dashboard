ALTER TABLE `automation_logs` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`);