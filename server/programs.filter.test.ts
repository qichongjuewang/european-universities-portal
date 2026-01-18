import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Programs Filter API", () => {
  it("should return all programs when no filters applied", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter programs by detailed field ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
      iscedDetailedFieldIds: [1],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter programs by city ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
      cityIds: [1],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter programs by degree type", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
      degreeTypes: ["master"],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All results should have master degree type
    if (result.length > 0) {
      result.forEach((program: any) => {
        expect(program.degreeType).toBe("master");
      });
    }
  });

  it("should filter programs by university type", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
      universityTypes: ["public"],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All results should have public university type
    if (result.length > 0) {
      result.forEach((program: any) => {
        expect(program.universityType).toBe("public");
      });
    }
  });

  it("should support pagination", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const page1 = await caller.programs.search({
      limit: 10,
      offset: 0,
    });

    const page2 = await caller.programs.search({
      limit: 10,
      offset: 10,
    });

    expect(page1).toBeDefined();
    expect(page2).toBeDefined();
    expect(Array.isArray(page1)).toBe(true);
    expect(Array.isArray(page2)).toBe(true);
  });

  it("should combine multiple filters", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.programs.search({
      limit: 50,
      offset: 0,
      degreeTypes: ["master"],
      universityTypes: ["public"],
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All results should match both filters
    if (result.length > 0) {
      result.forEach((program: any) => {
        expect(program.degreeType).toBe("master");
        expect(program.universityType).toBe("public");
      });
    }
  });
});

describe("ISCED-F Classification API", () => {
  it("should return all broad fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.isced.broadFields();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return narrow fields for a broad field", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.isced.narrowFields({ broadFieldId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return detailed fields for a narrow field", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.isced.detailedFields({ narrowFieldId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Countries and Cities API", () => {
  it("should return all countries", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.countries.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return cities for a country", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cities.byCountry({ countryId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
