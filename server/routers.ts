import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getIscedBroadFields,
  getIscedNarrowFieldsByBroad,
  getIscedDetailedFieldsByNarrow,
  getCountries,
  getCountryById,
  getCitiesByCountry,
  getUniversitiesByCountry,
  getUniversityById,
  getProgramsByFilters,
  getProgramById,
  getTuitionFeeByProgram,
  getAccommodationFeesByUniversity,
  getScholarshipsByProgram,
  getScholarshipsByUniversity,
  getCoursesByProgram,
  getEmploymentOutcomeByProgram,
  getStudentOpportunitiesByProgram,
  getStudentOpportunitiesByUniversity,
  searchPrograms,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const { COOKIE_NAME } = require("@shared/const");
      const { getSessionCookieOptions } = require("./_core/cookies");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ISCED-F Classification APIs
  isced: router({
    broadFields: publicProcedure.query(() => getIscedBroadFields()),

    narrowFields: publicProcedure
      .input(z.object({ broadFieldId: z.number() }))
      .query(({ input }) => getIscedNarrowFieldsByBroad(input.broadFieldId)),

    detailedFields: publicProcedure
      .input(z.object({ narrowFieldId: z.number() }))
      .query(({ input }) =>
        getIscedDetailedFieldsByNarrow(input.narrowFieldId)
      ),
  }),

  // Country APIs
  countries: router({
    list: publicProcedure.query(() => getCountries()),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCountryById(input.id)),
  }),

  // City APIs
  cities: router({
    byCountry: publicProcedure
      .input(z.object({ countryId: z.number() }))
      .query(({ input }) => getCitiesByCountry(input.countryId)),
  }),

  // University APIs
  universities: router({
    byCountry: publicProcedure
      .input(z.object({ countryId: z.number() }))
      .query(({ input }) => getUniversitiesByCountry(input.countryId)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const uni = await getUniversityById(input.id);
        if (!uni) return null;

        const accommodations = await getAccommodationFeesByUniversity(
          input.id
        );
        const scholarships = await getScholarshipsByUniversity(input.id);
        const opportunities = await getStudentOpportunitiesByUniversity(
          input.id
        );

        return {
          ...uni,
          accommodations,
          scholarships,
          opportunities,
        };
      }),
  }),

  // Program APIs
  programs: router({
    search: publicProcedure
      .input(
        z.object({
          universityIds: z.array(z.number()).optional(),
          cityIds: z.array(z.number()).optional(),
          iscedDetailedFieldIds: z.array(z.number()).optional(),
          degreeTypes: z.array(z.string()).optional(),
          universityTypes: z.array(z.string()).optional(),
          limit: z.number().optional().default(20),
          offset: z.number().optional().default(0),
        })
      )
      .query(({ input }) =>
        getProgramsByFilters({
          universityIds: input.universityIds,
          cityIds: input.cityIds,
          iscedDetailedFieldIds: input.iscedDetailedFieldIds,
          degreeTypes: input.degreeTypes,
          universityTypes: input.universityTypes,
          limit: input.limit,
          offset: input.offset,
        })
      ),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const program = await getProgramById(input.id);
        if (!program) return null;

        const tuition = await getTuitionFeeByProgram(input.id);
        const scholarships = await getScholarshipsByProgram(input.id);
        const courses = await getCoursesByProgram(input.id);
        const employment = await getEmploymentOutcomeByProgram(input.id);
        const opportunities = await getStudentOpportunitiesByProgram(input.id);

        return {
          ...program,
          tuition,
          scholarships,
          courses,
          employment,
          opportunities,
        };
      }),

    textSearch: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(({ input }) =>
        searchPrograms(input.query, input.limit || 20)
      ),
  }),
});

export type AppRouter = typeof appRouter;
