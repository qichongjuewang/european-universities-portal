import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import {
  getIscedBroadFields,
  getIscedNarrowFieldsByBroad,
  getIscedDetailedFieldsByNarrow,
  getCountries,
  getCitiesByCountry,
  getProgramsByFilters,
  getProgramById,
  getTuitionFeeByProgram,
} from "./db";

describe("Program APIs", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("ISCED-F Classification APIs", () => {
    it("should fetch broad fields", async () => {
      const broadFields = await getIscedBroadFields();
      expect(Array.isArray(broadFields)).toBe(true);
      expect(broadFields.length).toBeGreaterThan(0);
      expect(broadFields[0]).toHaveProperty("id");
      expect(broadFields[0]).toHaveProperty("nameCn");
      expect(broadFields[0]).toHaveProperty("nameEn");
    });

    it("should fetch narrow fields by broad field ID", async () => {
      const broadFields = await getIscedBroadFields();
      if (broadFields.length > 0) {
        const narrowFields = await getIscedNarrowFieldsByBroad(broadFields[0].id);
        expect(Array.isArray(narrowFields)).toBe(true);
        if (narrowFields.length > 0) {
          expect(narrowFields[0]).toHaveProperty("broadFieldId");
          expect(narrowFields[0].broadFieldId).toBe(broadFields[0].id);
        }
      }
    });

    it("should fetch detailed fields by narrow field ID", async () => {
      const broadFields = await getIscedBroadFields();
      if (broadFields.length > 0) {
        const narrowFields = await getIscedNarrowFieldsByBroad(broadFields[0].id);
        if (narrowFields.length > 0) {
          const detailedFields = await getIscedDetailedFieldsByNarrow(narrowFields[0].id);
          expect(Array.isArray(detailedFields)).toBe(true);
          if (detailedFields.length > 0) {
            expect(detailedFields[0]).toHaveProperty("narrowFieldId");
            expect(detailedFields[0].narrowFieldId).toBe(narrowFields[0].id);
          }
        }
      }
    });
  });

  describe("Country and City APIs", () => {
    it("should fetch all countries", async () => {
      const countries = await getCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries[0]).toHaveProperty("id");
      expect(countries[0]).toHaveProperty("nameCn");
      expect(countries[0]).toHaveProperty("nameEn");
    });

    it("should fetch cities by country ID", async () => {
      const countries = await getCountries();
      if (countries.length > 0) {
        const cities = await getCitiesByCountry(countries[0].id);
        expect(Array.isArray(cities)).toBe(true);
        if (cities.length > 0) {
          expect(cities[0]).toHaveProperty("countryId");
          expect(cities[0].countryId).toBe(countries[0].id);
        }
      }
    });
  });

  describe("Program APIs", () => {
    it("should fetch programs with filters", async () => {
      const result = await getProgramsByFilters({
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("programs");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.programs)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should fetch programs with pagination", async () => {
      const result1 = await getProgramsByFilters({
        limit: 5,
        offset: 0,
      });
      const result2 = await getProgramsByFilters({
        limit: 5,
        offset: 5,
      });
      expect(result1.programs.length).toBeLessThanOrEqual(5);
      expect(result2.programs.length).toBeLessThanOrEqual(5);
    });

    it("should filter programs by degree type", async () => {
      const result = await getProgramsByFilters({
        degreeTypes: ["master"],
        limit: 20,
        offset: 0,
      });
      expect(Array.isArray(result.programs)).toBe(true);
      result.programs.forEach((program: any) => {
        expect(program.degreeType).toBe("master");
      });
    });

    it("should filter programs by university type", async () => {
      const result = await getProgramsByFilters({
        universityTypes: ["public"],
        limit: 20,
        offset: 0,
      });
      expect(Array.isArray(result.programs)).toBe(true);
      result.programs.forEach((program: any) => {
        expect(program.universityType).toBe("public");
      });
    });

    it("should fetch program by ID", async () => {
      const result = await getProgramsByFilters({
        limit: 1,
        offset: 0,
      });
      if (result.programs.length > 0) {
        const programId = result.programs[0].id;
        const program = await getProgramById(programId);
        expect(program).not.toBeNull();
        expect(program?.id).toBe(programId);
        expect(program).toHaveProperty("nameCn");
        expect(program).toHaveProperty("nameEn");
      }
    });

    it("should fetch tuition fee by program ID", async () => {
      const result = await getProgramsByFilters({
        limit: 1,
        offset: 0,
      });
      if (result.programs.length > 0) {
        const programId = result.programs[0].id;
        const tuition = await getTuitionFeeByProgram(programId);
        if (tuition) {
          expect(tuition).toHaveProperty("programId");
          expect(tuition.programId).toBe(programId);
          expect(tuition).toHaveProperty("annualFeeAmount");
          expect(tuition).toHaveProperty("currencyCode");
        }
      }
    });

    it("should return programs with university and city names", async () => {
      const result = await getProgramsByFilters({
        limit: 5,
        offset: 0,
      });
      result.programs.forEach((program: any) => {
        expect(program).toHaveProperty("universityName");
        expect(program).toHaveProperty("cityName");
        expect(program).toHaveProperty("countryName");
      });
    });

    it("should filter by ISCED detailed field", async () => {
      const broadFields = await getIscedBroadFields();
      if (broadFields.length > 0) {
        const narrowFields = await getIscedNarrowFieldsByBroad(broadFields[0].id);
        if (narrowFields.length > 0) {
          const detailedFields = await getIscedDetailedFieldsByNarrow(narrowFields[0].id);
          if (detailedFields.length > 0) {
            const result = await getProgramsByFilters({
              iscedDetailedFieldIds: [detailedFields[0].id],
              limit: 20,
              offset: 0,
            });
            expect(Array.isArray(result.programs)).toBe(true);
            result.programs.forEach((program: any) => {
              expect(program.iscedDetailedFieldId).toBe(detailedFields[0].id);
            });
          }
        }
      }
    });

    it("should combine multiple filters", async () => {
      const result = await getProgramsByFilters({
        degreeTypes: ["master"],
        universityTypes: ["public"],
        limit: 20,
        offset: 0,
      });
      expect(Array.isArray(result.programs)).toBe(true);
      result.programs.forEach((program: any) => {
        expect(program.degreeType).toBe("master");
        expect(program.universityType).toBe("public");
      });
    });
  });
});
