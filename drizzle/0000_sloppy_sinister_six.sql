CREATE TABLE `accommodation_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`universityId` int NOT NULL,
	`accommodationType` varchar(100) NOT NULL,
	`monthlyFeeMin` decimal(10,2) NOT NULL,
	`monthlyFeeMax` decimal(10,2) NOT NULL,
	`currencyCode` varchar(3) NOT NULL,
	`rmbExchangeRate` decimal(8,4) NOT NULL,
	`rmbMonthlyMin` decimal(10,2) NOT NULL,
	`rmbMonthlyMax` decimal(10,2) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accommodation_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(2) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`isEU` boolean NOT NULL DEFAULT false,
	`isSchengen` boolean NOT NULL DEFAULT false,
	`description` text,
	`visaInfo` text,
	`residencyInfo` text,
	`greenCardInfo` text,
	`costOfLiving` text,
	`touristInfo` text,
	`officialLinks` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`courseCode` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`credits` int,
	`description` text,
	`isCoreRequired` boolean NOT NULL DEFAULT false,
	`semester` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employment_outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`employmentRate` decimal(5,2),
	`averageSalary` text,
	`topEmployers` text,
	`careerPaths` text,
	`alumniInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employment_outcomes_id` PRIMARY KEY(`id`),
	CONSTRAINT `employment_outcomes_programId_unique` UNIQUE(`programId`)
);
--> statement-breakpoint
CREATE TABLE `isced_broad_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(2) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `isced_broad_fields_id` PRIMARY KEY(`id`),
	CONSTRAINT `isced_broad_fields_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `isced_detailed_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(4) NOT NULL,
	`narrowFieldId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `isced_detailed_fields_id` PRIMARY KEY(`id`),
	CONSTRAINT `isced_detailed_fields_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `isced_narrow_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(3) NOT NULL,
	`broadFieldId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `isced_narrow_fields_id` PRIMARY KEY(`id`),
	CONSTRAINT `isced_narrow_fields_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`universityId` int NOT NULL,
	`cityId` int NOT NULL,
	`iscedDetailedFieldId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`degreeType` enum('bachelor','master','phd','foundation','diploma') NOT NULL,
	`universityType` enum('public','private') NOT NULL,
	`durationMonths` int NOT NULL,
	`teachingLanguage` text,
	`admissionRequirements` text,
	`description` text,
	`officialUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scholarships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`universityId` int,
	`programId` int,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`awardAmount` text,
	`eligibility` text,
	`applicationDeadline` varchar(50),
	`description` text,
	`officialUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scholarships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_index` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`searchText` varchar(1000) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_index_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_index_programId_unique` UNIQUE(`programId`)
);
--> statement-breakpoint
CREATE TABLE `student_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`universityId` int,
	`programId` int,
	`opportunityType` enum('on_campus_work','internship','co_op','research') NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`description` text,
	`hourlyRate` text,
	`requirements` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tuition_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`currencyCode` varchar(3) NOT NULL,
	`annualFeeAmount` decimal(12,2) NOT NULL,
	`semesterFeeAmount` decimal(12,2),
	`isFree` boolean NOT NULL DEFAULT false,
	`rmbExchangeRate` decimal(8,4) NOT NULL,
	`rmbAnnualAmount` decimal(12,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tuition_fees_id` PRIMARY KEY(`id`),
	CONSTRAINT `tuition_fees_programId_unique` UNIQUE(`programId`)
);
--> statement-breakpoint
CREATE TABLE `universities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryId` int NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameCn` varchar(255) NOT NULL,
	`type` enum('public','private') NOT NULL,
	`qsRanking` int,
	`timesRanking` int,
	`arwuRanking` int,
	`description` text,
	`officialWebsite` varchar(500),
	`campuses` text,
	`studentServices` text,
	`facilities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `universities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `accommodation_university_idx` ON `accommodation_fees` (`universityId`);--> statement-breakpoint
CREATE INDEX `city_country_idx` ON `cities` (`countryId`);--> statement-breakpoint
CREATE INDEX `country_code_idx` ON `countries` (`code`);--> statement-breakpoint
CREATE INDEX `country_eu_idx` ON `countries` (`isEU`);--> statement-breakpoint
CREATE INDEX `country_schengen_idx` ON `countries` (`isSchengen`);--> statement-breakpoint
CREATE INDEX `course_program_idx` ON `courses` (`programId`);--> statement-breakpoint
CREATE INDEX `employment_program_idx` ON `employment_outcomes` (`programId`);--> statement-breakpoint
CREATE INDEX `isced_broad_code_idx` ON `isced_broad_fields` (`code`);--> statement-breakpoint
CREATE INDEX `isced_detailed_narrowfield_idx` ON `isced_detailed_fields` (`narrowFieldId`);--> statement-breakpoint
CREATE INDEX `isced_detailed_code_idx` ON `isced_detailed_fields` (`code`);--> statement-breakpoint
CREATE INDEX `isced_narrow_broadfield_idx` ON `isced_narrow_fields` (`broadFieldId`);--> statement-breakpoint
CREATE INDEX `isced_narrow_code_idx` ON `isced_narrow_fields` (`code`);--> statement-breakpoint
CREATE INDEX `program_university_idx` ON `programs` (`universityId`);--> statement-breakpoint
CREATE INDEX `program_city_idx` ON `programs` (`cityId`);--> statement-breakpoint
CREATE INDEX `program_isced_idx` ON `programs` (`iscedDetailedFieldId`);--> statement-breakpoint
CREATE INDEX `program_degree_idx` ON `programs` (`degreeType`);--> statement-breakpoint
CREATE INDEX `program_type_idx` ON `programs` (`universityType`);--> statement-breakpoint
CREATE INDEX `scholarship_university_idx` ON `scholarships` (`universityId`);--> statement-breakpoint
CREATE INDEX `scholarship_program_idx` ON `scholarships` (`programId`);--> statement-breakpoint
CREATE INDEX `search_program_idx` ON `search_index` (`programId`);--> statement-breakpoint
CREATE INDEX `search_text_idx` ON `search_index` (`searchText`);--> statement-breakpoint
CREATE INDEX `opportunity_university_idx` ON `student_opportunities` (`universityId`);--> statement-breakpoint
CREATE INDEX `opportunity_program_idx` ON `student_opportunities` (`programId`);--> statement-breakpoint
CREATE INDEX `tuition_program_idx` ON `tuition_fees` (`programId`);--> statement-breakpoint
CREATE INDEX `university_country_idx` ON `universities` (`countryId`);--> statement-breakpoint
CREATE INDEX `university_qs_idx` ON `universities` (`qsRanking`);--> statement-breakpoint
CREATE INDEX `university_times_idx` ON `universities` (`timesRanking`);--> statement-breakpoint
CREATE INDEX `university_arwu_idx` ON `universities` (`arwuRanking`);