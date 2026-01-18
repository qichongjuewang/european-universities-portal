import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
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
} from "../drizzle/schema.ts";
import { realUniversitiesData, realProgramsData, realCountriesData, realCitiesData } from "./real-data-scraper.mjs";

async function seedDatabase() {
  // 创建数据库连接
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("开始数据导入...");

    // 1. 导入ISCED-F分类数据
    console.log("导入ISCED-F分类数据...");
    const broadFieldsData = [
      { code: "00", nameEn: "Generic programmes and qualifications", nameCn: "通用课程与资格认证" },
      { code: "01", nameEn: "Education", nameCn: "教育" },
      { code: "02", nameEn: "Arts and humanities", nameCn: "艺术与人文" },
      { code: "03", nameEn: "Social sciences, journalism and information", nameCn: "社会科学、新闻学与信息" },
      { code: "04", nameEn: "Business, administration and law", nameCn: "商业、行政与法律" },
      { code: "05", nameEn: "Natural sciences, mathematics and statistics", nameCn: "自然科学、数学与统计" },
      { code: "06", nameEn: "Information and Communication Technologies", nameCn: "信息与通信技术" },
      { code: "07", nameEn: "Engineering, manufacturing and construction", nameCn: "工程、制造与建筑" },
      { code: "08", nameEn: "Agriculture, forestry, fisheries and veterinary", nameCn: "农业、林业、渔业与兽医" },
      { code: "09", nameEn: "Health and welfare", nameCn: "卫生与福利" },
      { code: "10", nameEn: "Services", nameCn: "服务" },
    ];

    for (const field of broadFieldsData) {
      await db.insert(iscedBroadFields).values(field).catch(() => {});
    }

    // 2. 导入狭义领域
    console.log("导入狭义领域...");
    const narrowFieldsData = [
      { broadFieldCode: "04", code: "041", nameEn: "Business and administration", nameCn: "商业与行政" },
      { broadFieldCode: "04", code: "042", nameEn: "Law", nameCn: "法律" },
      { broadFieldCode: "06", code: "061", nameEn: "Computer use", nameCn: "计算机使用" },
      { broadFieldCode: "06", code: "062", nameEn: "Database and network design and administration", nameCn: "数据库与网络设计" },
      { broadFieldCode: "06", code: "063", nameEn: "Software and applications development and analysis", nameCn: "软件与应用开发" },
      { broadFieldCode: "05", code: "051", nameEn: "Biological and related sciences", nameCn: "生物学与相关科学" },
      { broadFieldCode: "05", code: "052", nameEn: "Environment", nameCn: "环境科学" },
      { broadFieldCode: "05", code: "053", nameEn: "Physical sciences", nameCn: "物理科学" },
      { broadFieldCode: "07", code: "071", nameEn: "Engineering and engineering trades", nameCn: "工程与工程技术" },
      { broadFieldCode: "07", code: "072", nameEn: "Manufacturing and processing", nameCn: "制造与加工" },
    ];

    for (const field of narrowFieldsData) {
      await db.insert(iscedNarrowFields).values(field).catch(() => {});
    }

    // 3. 导入详细领域
    console.log("导入详细领域...");
    const detailedFieldsData = [
      { narrowFieldCode: "041", code: "0411", nameEn: "Accounting and related fields", nameCn: "会计与相关领域" },
      { narrowFieldCode: "041", code: "0412", nameEn: "Finance, banking and related fields", nameCn: "金融、银行与相关领域" },
      { narrowFieldCode: "041", code: "0413", nameEn: "Management and administration", nameCn: "管理与行政" },
      { narrowFieldCode: "042", code: "0421", nameEn: "Law", nameCn: "法律" },
      { narrowFieldCode: "061", code: "0611", nameEn: "Computer use", nameCn: "计算机使用" },
      { narrowFieldCode: "062", code: "0621", nameEn: "Database and network design and administration", nameCn: "数据库与网络设计" },
      { narrowFieldCode: "063", code: "0631", nameEn: "Software and applications development and analysis", nameCn: "软件与应用开发" },
      { narrowFieldCode: "063", code: "0632", nameEn: "Web and multimedia developers", nameCn: "网络与多媒体开发" },
      { narrowFieldCode: "053", code: "0531", nameEn: "Physics", nameCn: "物理学" },
      { narrowFieldCode: "071", code: "0711", nameEn: "Engineering and engineering trades", nameCn: "工程与工程技术" },
    ];

    for (const field of detailedFieldsData) {
      await db.insert(iscedDetailedFields).values(field).catch(() => {});
    }

    // 4. 导入国家数据
    console.log("导入国家数据...");
    for (const country of realCountriesData) {
      await db
        .insert(countries)
        .values({
          code: country.code,
          nameEn: country.nameEn,
          nameCn: country.nameCn,
          isEU: country.isEU,
          isSchengen: country.isSchengen,
          visaRequirement: country.visaRequirement,
          residencePolicy: country.residencePolicy,
          greenCardPath: country.greenCardPath,
          costOfLiving: country.costOfLiving,
          tourismInfo: country.tourismInfo,
          officialLink: country.officialLink,
        })
        .catch(() => {});
    }

    // 5. 导入城市数据
    console.log("导入城市数据...");
    for (const city of realCitiesData) {
      const countryRecord = await db
        .select()
        .from(countries)
        .where((c) => c.code === city.country)
        .limit(1);

      if (countryRecord.length > 0) {
        await db
          .insert(cities)
          .values({
            countryId: countryRecord[0].id,
            nameEn: city.nameEn,
            nameCn: city.nameCn,
            latitude: city.latitude,
            longitude: city.longitude,
          })
          .catch(() => {});
      }
    }

    // 6. 导入大学数据
    console.log("导入大学数据...");
    for (const uni of realUniversitiesData) {
      const countryRecord = await db
        .select()
        .from(countries)
        .where((c) => c.code === uni.country)
        .limit(1);

      const cityRecord = await db
        .select()
        .from(cities)
        .where((c) => c.nameEn === uni.city)
        .limit(1);

      if (countryRecord.length > 0 && cityRecord.length > 0) {
        await db
          .insert(universities)
          .values({
            nameEn: uni.nameEn,
            nameCn: uni.nameCn,
            countryId: countryRecord[0].id,
            cityId: cityRecord[0].id,
            type: uni.type,
            officialWebsite: uni.officialWebsite,
          })
          .catch(() => {});
      }
    }

    // 7. 导入专业数据
    console.log("导入专业数据...");
    for (const prog of realProgramsData) {
      const uniRecord = await db
        .select()
        .from(universities)
        .where((u) => u.nameEn === prog.universityName)
        .limit(1);

      const detailedFieldRecord = await db
        .select()
        .from(iscedDetailedFields)
        .where((f) => f.code === prog.iscedDetailedField)
        .limit(1);

      if (uniRecord.length > 0 && detailedFieldRecord.length > 0) {
        const programRecord = await db
          .insert(programs)
          .values({
            universityId: uniRecord[0].id,
            iscedDetailedFieldId: detailedFieldRecord[0].id,
            nameEn: prog.programNameEn,
            nameCn: prog.programNameCn,
            degreeType: prog.degreeType,
            durationMonths: prog.durationMonths,
            teachingLanguage: prog.teachingLanguage,
            admissionRequirements: prog.admissionRequirements,
          })
          .catch(() => {});

        // 8. 导入学费数据
        if (programRecord && programRecord.length > 0) {
          const tuitionAmount = prog.tuitionEUR || prog.tuitionGBP || prog.tuitionCHF || 0;
          const tuitionCurrency = prog.tuitionEUR ? "EUR" : prog.tuitionGBP ? "GBP" : "CHF";

          await db
            .insert(tuitionFees)
            .values({
              programId: programRecord[0].insertId,
              amount: tuitionAmount,
              currency: tuitionCurrency,
              amountCNY: prog.tuitionCNY || 0,
              perYear: true,
              includesAccommodation: false,
            })
            .catch(() => {});
        }
      }
    }

    // 9. 排名数据已在大学表中存储，无需单独导入

    console.log("✅ 数据导入完成！");
  } catch (error) {
    console.error("❌ 数据导入失败:", error);
  } finally {
    await connection.end();
  }
}

seedDatabase();
