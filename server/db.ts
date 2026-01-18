import { eq, and, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  iscedBroadFields,
  iscedNarrowFields,
  iscedDetailedFields,
  countries,
  cities,
  universities,
  programs,
  tuitionFees,
  accommodationFees,
  scholarships,
  courses,
  employmentOutcomes,
  studentOpportunities,
  searchIndex,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ISCED-F Classification Queries
export async function getIscedBroadFields() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(iscedBroadFields);
}

export async function getIscedNarrowFieldsByBroad(broadFieldId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(iscedNarrowFields)
    .where(eq(iscedNarrowFields.broadFieldId, broadFieldId));
}

export async function getIscedDetailedFieldsByNarrow(narrowFieldId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(iscedDetailedFields)
    .where(eq(iscedDetailedFields.narrowFieldId, narrowFieldId));
}

// Country Queries
export async function getCountries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(countries);
}

export async function getCountryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(countries)
    .where(eq(countries.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// City Queries
export async function getCitiesByCountry(countryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cities).where(eq(cities.countryId, countryId));
}

// University Queries
export async function getUniversitiesByCountry(countryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(universities)
    .where(eq(universities.countryId, countryId));
}

export async function getUniversityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(universities)
    .where(eq(universities.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Program Queries
export async function getProgramsByFilters(filters: {
  universityIds?: number[];
  cityIds?: number[];
  iscedDetailedFieldIds?: number[];
  degreeTypes?: string[];
  universityTypes?: string[];
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters.universityIds?.length) {
    conditions.push(inArray(programs.universityId, filters.universityIds));
  }

  if (filters.cityIds?.length) {
    conditions.push(inArray(programs.cityId, filters.cityIds));
  }

  if (filters.iscedDetailedFieldIds?.length) {
    conditions.push(
      inArray(programs.iscedDetailedFieldId, filters.iscedDetailedFieldIds)
    );
  }

  if (filters.degreeTypes?.length) {
    conditions.push(inArray(programs.degreeType, filters.degreeTypes as any));
  }

  if (filters.universityTypes?.length) {
    conditions.push(
      inArray(programs.universityType, filters.universityTypes as any)
    );
  }

  let query: any = db.select().from(programs);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

export async function getProgramById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(programs)
    .where(eq(programs.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Tuition Fee Queries
export async function getTuitionFeeByProgram(programId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(tuitionFees)
    .where(eq(tuitionFees.programId, programId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Accommodation Fee Queries
export async function getAccommodationFeesByUniversity(universityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(accommodationFees)
    .where(eq(accommodationFees.universityId, universityId));
}

// Scholarship Queries
export async function getScholarshipsByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scholarships)
    .where(eq(scholarships.programId, programId));
}

export async function getScholarshipsByUniversity(universityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scholarships)
    .where(eq(scholarships.universityId, universityId));
}

// Course Queries
export async function getCoursesByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.programId, programId));
}

// Employment Outcome Queries
export async function getEmploymentOutcomeByProgram(programId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(employmentOutcomes)
    .where(eq(employmentOutcomes.programId, programId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Student Opportunity Queries
export async function getStudentOpportunitiesByProgram(programId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(studentOpportunities)
    .where(eq(studentOpportunities.programId, programId));
}

export async function getStudentOpportunitiesByUniversity(
  universityId: number
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(studentOpportunities)
    .where(eq(studentOpportunities.universityId, universityId));
}

// Search Index Queries
export async function searchPrograms(searchText: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchPattern = `%${searchText}%`;
  const results = await db
    .select({ programId: searchIndex.programId })
    .from(searchIndex)
    .where(like(searchIndex.searchText, searchPattern))
    .limit(limit);

  const programIds = results.map((r) => r.programId);
  if (programIds.length === 0) return [];

  return db.select().from(programs).where(inArray(programs.id, programIds));
}
