import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Complete API Verification", () => {
  it("should verify all ISCED-F APIs work correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test broad fields
    const broadFields = await caller.isced.broadFields();
    expect(Array.isArray(broadFields)).toBe(true);
    expect(broadFields.length).toBeGreaterThan(0);

    // Test narrow fields
    if (broadFields.length > 0) {
      const narrowFields = await caller.isced.narrowFields({
        broadFieldId: broadFields[0].id,
      });
      expect(Array.isArray(narrowFields)).toBe(true);

      // Test detailed fields
      if (narrowFields.length > 0) {
        const detailedFields = await caller.isced.detailedFields({
          narrowFieldId: narrowFields[0].id,
        });
        expect(Array.isArray(detailedFields)).toBe(true);
      }
    }
  });

  it("should verify all Country and City APIs work correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test countries list
    const countries = await caller.countries.list();
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);

    // Test country by ID
    const country = await caller.countries.byId({ id: countries[0].id });
    expect(country).not.toBeNull();
    expect(country?.id).toBe(countries[0].id);

    // Test cities by country
    const cities = await caller.cities.byCountry({
      countryId: countries[0].id,
    });
    expect(Array.isArray(cities)).toBe(true);
  });

  it("should verify all University APIs work correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test universities by country
    const countries = await caller.countries.list();
    if (countries.length > 0) {
      const universities = await caller.universities.byCountry({
        countryId: countries[0].id,
      });
      expect(Array.isArray(universities)).toBe(true);

      // Test university by ID
      if (universities.length > 0) {
        const university = await caller.universities.byId({
          id: universities[0].id,
        });
        expect(university).not.toBeNull();
        expect(university?.id).toBe(universities[0].id);
      }
    }
  });

  it("should verify all Program APIs work correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test programs list
    const programsData = await caller.programs.list({
      limit: 10,
      offset: 0,
    });
    expect(programsData).toHaveProperty("programs");
    expect(programsData).toHaveProperty("total");
    expect(Array.isArray(programsData.programs)).toBe(true);

    // Test program by ID
    if (programsData.programs.length > 0) {
      const program = await caller.programs.byId({
        id: programsData.programs[0].id,
      });
      expect(program).not.toBeNull();
      expect(program?.id).toBe(programsData.programs[0].id);

      // Test program detail
      const detail = await caller.programs.detail({
        id: programsData.programs[0].id,
      });
      expect(detail).not.toBeNull();
      expect(detail).toHaveProperty("tuition");
      expect(detail).toHaveProperty("scholarships");
      expect(detail).toHaveProperty("courses");
      expect(detail).toHaveProperty("employment");
      expect(detail).toHaveProperty("opportunities");
    }
  });

  it("should verify Program filtering works correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test filtering by degree type
    const masterPrograms = await caller.programs.list({
      degreeTypes: ["master"],
      limit: 20,
      offset: 0,
    });
    expect(Array.isArray(masterPrograms.programs)).toBe(true);
    masterPrograms.programs.forEach((p: any) => {
      expect(p.degreeType).toBe("master");
    });

    // Test filtering by university type
    const publicUniversities = await caller.programs.list({
      universityTypes: ["public"],
      limit: 20,
      offset: 0,
    });
    expect(Array.isArray(publicUniversities.programs)).toBe(true);
    publicUniversities.programs.forEach((p: any) => {
      expect(p.universityType).toBe("public");
    });

    // Test combined filters
    const filtered = await caller.programs.list({
      degreeTypes: ["master"],
      universityTypes: ["public"],
      limit: 20,
      offset: 0,
    });
    expect(Array.isArray(filtered.programs)).toBe(true);
    filtered.programs.forEach((p: any) => {
      expect(p.degreeType).toBe("master");
      expect(p.universityType).toBe("public");
    });
  });

  it("should verify Program pagination works correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test first page
    const page1 = await caller.programs.list({
      limit: 5,
      offset: 0,
    });
    expect(page1.programs.length).toBeLessThanOrEqual(5);

    // Test second page
    const page2 = await caller.programs.list({
      limit: 5,
      offset: 5,
    });
    expect(page2.programs.length).toBeLessThanOrEqual(5);

    // Verify different results
    if (page1.programs.length > 0 && page2.programs.length > 0) {
      const page1Ids = page1.programs.map((p: any) => p.id);
      const page2Ids = page2.programs.map((p: any) => p.id);
      expect(page1Ids).not.toEqual(page2Ids);
    }
  });

  it("should verify Program search works correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Get a program first
    const programs = await caller.programs.list({
      limit: 1,
      offset: 0,
    });

    if (programs.programs.length > 0) {
      const program = programs.programs[0];
      // Search by program name
      const searchResults = await caller.programs.search({
        query: program.nameCn || program.nameEn || "",
        limit: 10,
      });
      expect(Array.isArray(searchResults)).toBe(true);
    }
  });

  it("should verify all data has required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Get programs
    const programsData = await caller.programs.list({
      limit: 5,
      offset: 0,
    });

    programsData.programs.forEach((program: any) => {
      // Check required program fields
      expect(program).toHaveProperty("id");
      expect(program).toHaveProperty("nameCn");
      expect(program).toHaveProperty("nameEn");
      expect(program).toHaveProperty("degreeType");
      expect(program).toHaveProperty("universityType");
      expect(program).toHaveProperty("durationMonths");
      expect(program).toHaveProperty("universityId");
      expect(program).toHaveProperty("cityId");
      expect(program).toHaveProperty("iscedDetailedFieldId");

      // Check joined fields
      expect(program).toHaveProperty("universityName");
      expect(program).toHaveProperty("cityName");
      expect(program).toHaveProperty("countryName");
    });
  });

  it("should verify program detail has complete data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Get programs and check detail has tuition
    const programsData = await caller.programs.list({
      limit: 1,
      offset: 0,
    });

    if (programsData.programs.length > 0) {
      const detail = await caller.programs.detail({
        id: programsData.programs[0].id,
      });
      if (detail?.tuition) {
        expect(detail.tuition).toHaveProperty("annualFeeAmount");
        expect(detail.tuition).toHaveProperty("currencyCode");
        expect(detail.tuition).toHaveProperty("rmbAnnualAmount");
      }
    }
  });
});
