import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ISCED-F Broad Fields (Level 1) - 11个宽泛领域
 */
export const iscedBroadFields = mysqlTable(
  "isced_broad_fields",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 2 }).notNull().unique(), // 00-10
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index("isced_broad_code_idx").on(table.code),
  })
);

export type IscedBroadField = typeof iscedBroadFields.$inferSelect;
export type InsertIscedBroadField = typeof iscedBroadFields.$inferInsert;

/**
 * ISCED-F Narrow Fields (Level 2) - 29个狭义领域
 */
export const iscedNarrowFields = mysqlTable(
  "isced_narrow_fields",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 3 }).notNull().unique(), // 001-101
    broadFieldId: int("broadFieldId").notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    broadFieldIdx: index("isced_narrow_broadfield_idx").on(table.broadFieldId),
    codeIdx: index("isced_narrow_code_idx").on(table.code),
  })
);

export type IscedNarrowField = typeof iscedNarrowFields.$inferSelect;
export type InsertIscedNarrowField = typeof iscedNarrowFields.$inferInsert;

/**
 * ISCED-F Detailed Fields (Level 3) - 约80个详细领域
 */
export const iscedDetailedFields = mysqlTable(
  "isced_detailed_fields",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 4 }).notNull().unique(), // 0011-1015
    narrowFieldId: int("narrowFieldId").notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    narrowFieldIdx: index("isced_detailed_narrowfield_idx").on(table.narrowFieldId),
    codeIdx: index("isced_detailed_code_idx").on(table.code),
  })
);

export type IscedDetailedField = typeof iscedDetailedFields.$inferSelect;
export type InsertIscedDetailedField = typeof iscedDetailedFields.$inferInsert;

/**
 * Countries with EU/Schengen markers
 */
export const countries = mysqlTable(
  "countries",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 2 }).notNull().unique(), // ISO 3166-1 alpha-2
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    isEU: boolean("isEU").default(false).notNull(),
    isSchengen: boolean("isSchengen").default(false).notNull(),
    description: text("description"),
    visaInfo: text("visaInfo"), // JSON string
    residencyInfo: text("residencyInfo"), // JSON string
    greenCardInfo: text("greenCardInfo"), // JSON string
    costOfLiving: text("costOfLiving"), // JSON string
    touristInfo: text("touristInfo"), // JSON string
    officialLinks: text("officialLinks"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: index("country_code_idx").on(table.code),
    euIdx: index("country_eu_idx").on(table.isEU),
    schengenIdx: index("country_schengen_idx").on(table.isSchengen),
  })
);

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

/**
 * Cities
 */
export const cities = mysqlTable(
  "cities",
  {
    id: int("id").autoincrement().primaryKey(),
    countryId: int("countryId").notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    countryIdx: index("city_country_idx").on(table.countryId),
  })
);

export type City = typeof cities.$inferSelect;
export type InsertCity = typeof cities.$inferInsert;

/**
 * Universities
 */
export const universities = mysqlTable(
  "universities",
  {
    id: int("id").autoincrement().primaryKey(),
    countryId: int("countryId").notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["public", "private"]).notNull(),
    qsRanking: int("qsRanking"),
    timesRanking: int("timesRanking"),
    arwuRanking: int("arwuRanking"),
    description: text("description"),
    officialWebsite: varchar("officialWebsite", { length: 500 }),
    campuses: text("campuses"), // JSON string with locations and coordinates
    studentServices: text("studentServices"), // JSON string
    facilities: text("facilities"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    countryIdx: index("university_country_idx").on(table.countryId),
    qsIdx: index("university_qs_idx").on(table.qsRanking),
    timesIdx: index("university_times_idx").on(table.timesRanking),
    arwuIdx: index("university_arwu_idx").on(table.arwuRanking),
  })
);

export type University = typeof universities.$inferSelect;
export type InsertUniversity = typeof universities.$inferInsert;

/**
 * Programs (Majors/Specializations)
 */
export const programs = mysqlTable(
  "programs",
  {
    id: int("id").autoincrement().primaryKey(),
    universityId: int("universityId").notNull(),
    cityId: int("cityId").notNull(),
    iscedDetailedFieldId: int("iscedDetailedFieldId").notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    degreeType: mysqlEnum("degreeType", [
      "bachelor",
      "master",
      "phd",
      "foundation",
      "diploma",
    ]).notNull(),
    universityType: mysqlEnum("universityType", ["public", "private"]).notNull(),
    durationMonths: int("durationMonths").notNull(),
    teachingLanguage: text("teachingLanguage"), // JSON array
    admissionRequirements: text("admissionRequirements"), // JSON string
    description: text("description"),
    officialUrl: varchar("officialUrl", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    universityIdx: index("program_university_idx").on(table.universityId),
    cityIdx: index("program_city_idx").on(table.cityId),
    iscedIdx: index("program_isced_idx").on(table.iscedDetailedFieldId),
    degreeIdx: index("program_degree_idx").on(table.degreeType),
    typeIdx: index("program_type_idx").on(table.universityType),
  })
);

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

/**
 * Tuition Fees (per academic year)
 */
export const tuitionFees = mysqlTable(
  "tuition_fees",
  {
    id: int("id").autoincrement().primaryKey(),
    programId: int("programId").notNull().unique(),
    currencyCode: varchar("currencyCode", { length: 3 }).notNull(), // GBP, EUR, CHF, etc.
    annualFeeAmount: decimal("annualFeeAmount", { precision: 12, scale: 2 }).notNull(),
    semesterFeeAmount: decimal("semesterFeeAmount", { precision: 12, scale: 2 }), // If paid per semester
    isFree: boolean("isFree").default(false).notNull(),
    rmbExchangeRate: decimal("rmbExchangeRate", { precision: 8, scale: 4 }).notNull(),
    rmbAnnualAmount: decimal("rmbAnnualAmount", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    programIdx: index("tuition_program_idx").on(table.programId),
  })
);

export type TuitionFee = typeof tuitionFees.$inferSelect;
export type InsertTuitionFee = typeof tuitionFees.$inferInsert;

/**
 * Accommodation Fees
 */
export const accommodationFees = mysqlTable(
  "accommodation_fees",
  {
    id: int("id").autoincrement().primaryKey(),
    universityId: int("universityId").notNull(),
    accommodationType: varchar("accommodationType", { length: 100 }).notNull(), // e.g., "Single Room", "Double Room", "Studio"
    monthlyFeeMin: decimal("monthlyFeeMin", { precision: 10, scale: 2 }).notNull(),
    monthlyFeeMax: decimal("monthlyFeeMax", { precision: 10, scale: 2 }).notNull(),
    currencyCode: varchar("currencyCode", { length: 3 }).notNull(),
    rmbExchangeRate: decimal("rmbExchangeRate", { precision: 8, scale: 4 }).notNull(),
    rmbMonthlyMin: decimal("rmbMonthlyMin", { precision: 10, scale: 2 }).notNull(),
    rmbMonthlyMax: decimal("rmbMonthlyMax", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    universityIdx: index("accommodation_university_idx").on(table.universityId),
  })
);

export type AccommodationFee = typeof accommodationFees.$inferSelect;
export type InsertAccommodationFee = typeof accommodationFees.$inferInsert;

/**
 * Scholarships
 */
export const scholarships = mysqlTable(
  "scholarships",
  {
    id: int("id").autoincrement().primaryKey(),
    universityId: int("universityId"),
    programId: int("programId"),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    awardAmount: text("awardAmount"), // JSON string
    eligibility: text("eligibility"), // JSON string
    applicationDeadline: varchar("applicationDeadline", { length: 50 }),
    description: text("description"),
    officialUrl: varchar("officialUrl", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    universityIdx: index("scholarship_university_idx").on(table.universityId),
    programIdx: index("scholarship_program_idx").on(table.programId),
  })
);

export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = typeof scholarships.$inferInsert;

/**
 * Curriculum/Courses
 */
export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    programId: int("programId").notNull(),
    courseCode: varchar("courseCode", { length: 50 }).notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    credits: int("credits"),
    description: text("description"),
    isCoreRequired: boolean("isCoreRequired").default(false).notNull(),
    semester: int("semester"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    programIdx: index("course_program_idx").on(table.programId),
  })
);

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Employment Outcomes
 */
export const employmentOutcomes = mysqlTable(
  "employment_outcomes",
  {
    id: int("id").autoincrement().primaryKey(),
    programId: int("programId").notNull().unique(),
    employmentRate: decimal("employmentRate", { precision: 5, scale: 2 }), // percentage
    averageSalary: text("averageSalary"), // JSON string with currency
    topEmployers: text("topEmployers"), // JSON array
    careerPaths: text("careerPaths"), // JSON array
    alumniInfo: text("alumniInfo"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    programIdx: index("employment_program_idx").on(table.programId),
  })
);

export type EmploymentOutcome = typeof employmentOutcomes.$inferSelect;
export type InsertEmploymentOutcome = typeof employmentOutcomes.$inferInsert;

/**
 * Student Work & Internship Opportunities
 */
export const studentOpportunities = mysqlTable(
  "student_opportunities",
  {
    id: int("id").autoincrement().primaryKey(),
    universityId: int("universityId"),
    programId: int("programId"),
    opportunityType: mysqlEnum("opportunityType", [
      "on_campus_work",
      "internship",
      "co_op",
      "research",
    ]).notNull(),
    nameEn: varchar("nameEn", { length: 255 }).notNull(),
    nameCn: varchar("nameCn", { length: 255 }).notNull(),
    description: text("description"),
    hourlyRate: text("hourlyRate"), // JSON string
    requirements: text("requirements"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    universityIdx: index("opportunity_university_idx").on(table.universityId),
    programIdx: index("opportunity_program_idx").on(table.programId),
  })
);

export type StudentOpportunity = typeof studentOpportunities.$inferSelect;
export type InsertStudentOpportunity = typeof studentOpportunities.$inferInsert;

/**
 * Search Index for fast filtering
 * Stores denormalized search data for quick lookups
 */
export const searchIndex = mysqlTable(
  "search_index",
  {
    id: int("id").autoincrement().primaryKey(),
    programId: int("programId").notNull().unique(),
    searchText: varchar("searchText", { length: 1000 }).notNull(), // Denormalized search field
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    programIdx: index("search_program_idx").on(table.programId),
    textIdx: index("search_text_idx").on(table.searchText),
  })
);

export type SearchIndex = typeof searchIndex.$inferSelect;
export type InsertSearchIndex = typeof searchIndex.$inferInsert;
