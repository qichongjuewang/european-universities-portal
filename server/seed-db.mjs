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
} from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// ISCED-F Broad Fields Data
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

// ISCED-F Narrow Fields Data (Sample)
const narrowFieldsData = [
  { code: "001", broadFieldId: 1, nameEn: "Basic programmes and qualifications", nameCn: "基础课程与资格认证" },
  { code: "041", broadFieldId: 5, nameEn: "Business and administration", nameCn: "商业与行政" },
  { code: "042", broadFieldId: 5, nameEn: "Law", nameCn: "法律" },
  { code: "061", broadFieldId: 7, nameEn: "Information and Communication Technologies", nameCn: "信息与通信技术" },
  { code: "071", broadFieldId: 8, nameEn: "Engineering and engineering trades", nameCn: "工程与工程行业" },
  { code: "091", broadFieldId: 10, nameEn: "Health", nameCn: "卫生" },
];

// ISCED-F Detailed Fields Data (Sample)
const detailedFieldsData = [
  { code: "0411", narrowFieldId: 2, nameEn: "Accounting and taxation", nameCn: "会计与税务" },
  { code: "0412", narrowFieldId: 2, nameEn: "Finance, banking and insurance", nameCn: "金融、银行与保险" },
  { code: "0413", narrowFieldId: 2, nameEn: "Management and administration", nameCn: "管理与行政" },
  { code: "0421", narrowFieldId: 3, nameEn: "Law", nameCn: "法律" },
  { code: "0611", narrowFieldId: 4, nameEn: "Computer use", nameCn: "计算机使用" },
  { code: "0612", narrowFieldId: 4, nameEn: "Database and network design and administration", nameCn: "数据库与网络设计管理" },
  { code: "0613", narrowFieldId: 4, nameEn: "Software and applications development and analysis", nameCn: "软件与应用开发分析" },
  { code: "0711", narrowFieldId: 5, nameEn: "Chemical engineering and processes", nameCn: "化学工程与工艺" },
  { code: "0912", narrowFieldId: 6, nameEn: "Medicine", nameCn: "医学" },
];

// Countries Data (Sample)
const countriesData = [
  { code: "GB", nameEn: "United Kingdom", nameCn: "英国", isEU: false, isSchengen: false },
  { code: "DE", nameEn: "Germany", nameCn: "德国", isEU: true, isSchengen: true },
  { code: "FR", nameEn: "France", nameCn: "法国", isEU: true, isSchengen: true },
  { code: "CH", nameEn: "Switzerland", nameCn: "瑞士", isEU: false, isSchengen: true },
  { code: "NL", nameEn: "Netherlands", nameCn: "荷兰", isEU: true, isSchengen: true },
  { code: "SE", nameEn: "Sweden", nameCn: "瑞典", isEU: true, isSchengen: true },
];

// Cities Data (Sample)
const citiesData = [
  { countryId: 1, nameEn: "London", nameCn: "伦敦", latitude: 51.5074, longitude: -0.1278 },
  { countryId: 2, nameEn: "Berlin", nameCn: "柏林", latitude: 52.52, longitude: 13.405 },
  { countryId: 3, nameEn: "Paris", nameCn: "巴黎", latitude: 48.8566, longitude: 2.3522 },
  { countryId: 4, nameEn: "Zurich", nameCn: "苏黎世", latitude: 47.3769, longitude: 8.5472 },
  { countryId: 5, nameEn: "Amsterdam", nameCn: "阿姆斯特丹", latitude: 52.3676, longitude: 4.9041 },
  { countryId: 6, nameEn: "Stockholm", nameCn: "斯德哥尔摩", latitude: 59.3293, longitude: 18.0686 },
];

// Universities Data (Sample)
const universitiesData = [
  {
    countryId: 1,
    nameEn: "London School of Economics",
    nameCn: "伦敦政治经济学院",
    type: "public",
    qsRanking: 2,
    timesRanking: 2,
    arwuRanking: 3,
    officialWebsite: "https://www.lse.ac.uk",
  },
  {
    countryId: 2,
    nameEn: "Humboldt University of Berlin",
    nameCn: "柏林洪堡大学",
    type: "public",
    qsRanking: 70,
    timesRanking: 68,
    arwuRanking: 75,
    officialWebsite: "https://www.hu-berlin.de",
  },
  {
    countryId: 3,
    nameEn: "Sorbonne University",
    nameCn: "索邦大学",
    type: "public",
    qsRanking: 75,
    timesRanking: 70,
    arwuRanking: 80,
    officialWebsite: "https://www.sorbonne-universite.fr",
  },
  {
    countryId: 4,
    nameEn: "ETH Zurich",
    nameCn: "苏黎世联邦理工学院",
    type: "public",
    qsRanking: 11,
    timesRanking: 8,
    arwuRanking: 15,
    officialWebsite: "https://www.ethz.ch",
  },
];

// Programs Data (Sample)
const programsData = [
  {
    universityId: 1,
    cityId: 1,
    iscedDetailedFieldId: 3,
    nameEn: "MSc Finance",
    nameCn: "金融硕士",
    degreeType: "master",
    universityType: "public",
    durationMonths: 12,
    teachingLanguage: JSON.stringify(["English"]),
    admissionRequirements: JSON.stringify({
      bachelor: "Required",
      gmat: "650+",
      ielts: "7.0",
    }),
    officialUrl: "https://www.lse.ac.uk/study-at-lse/graduate/degree-programmes/msc-finance",
  },
  {
    universityId: 4,
    cityId: 4,
    iscedDetailedFieldId: 7,
    nameEn: "MSc Computer Science",
    nameCn: "计算机科学硕士",
    degreeType: "master",
    universityType: "public",
    durationMonths: 24,
    teachingLanguage: JSON.stringify(["English", "German"]),
    admissionRequirements: JSON.stringify({
      bachelor: "CS Related",
      english: "B2",
    }),
    officialUrl: "https://www.ethz.ch/en/studies/master/programmes/engineering-sciences/computer-science.html",
  },
];

// Tuition Fees Data (Sample)
const tuitionFeesData = [
  {
    programId: 1,
    currencyCode: "GBP",
    annualFeeAmount: 29408,
    isFree: false,
    rmbExchangeRate: 8.85,
    rmbAnnualAmount: 260260,
  },
  {
    programId: 2,
    currencyCode: "CHF",
    annualFeeAmount: 1460,
    semesterFeeAmount: 730,
    isFree: false,
    rmbExchangeRate: 7.55,
    rmbAnnualAmount: 11018,
  },
];

// Accommodation Fees Data (Sample)
const accommodationFeesData = [
  {
    universityId: 1,
    accommodationType: "Single Room",
    monthlyFeeMin: 800,
    monthlyFeeMax: 1200,
    currencyCode: "GBP",
    rmbExchangeRate: 8.85,
    rmbMonthlyMin: 7080,
    rmbMonthlyMax: 10620,
  },
  {
    universityId: 4,
    accommodationType: "Student Housing",
    monthlyFeeMin: 600,
    monthlyFeeMax: 900,
    currencyCode: "CHF",
    rmbExchangeRate: 7.55,
    rmbMonthlyMin: 4530,
    rmbMonthlyMax: 6795,
  },
];

// Scholarships Data (Sample)
const scholarshipsData = [
  {
    universityId: 1,
    programId: 1,
    nameEn: "LSE Postgraduate Scholarship",
    nameCn: "LSE研究生奖学金",
    awardAmount: JSON.stringify({ min: 5000, max: 15000, currency: "GBP" }),
    eligibility: JSON.stringify(["International Students", "Academic Excellence"]),
    applicationDeadline: "2024-03-31",
  },
];

// Courses Data (Sample)
const coursesData = [
  {
    programId: 1,
    courseCode: "FM101",
    nameEn: "Financial Analysis",
    nameCn: "财务分析",
    credits: 6,
    isCoreRequired: true,
    semester: 1,
  },
  {
    programId: 1,
    courseCode: "FM102",
    nameEn: "Investment Management",
    nameCn: "投资管理",
    credits: 6,
    isCoreRequired: true,
    semester: 1,
  },
];

// Employment Outcomes Data (Sample)
const employmentOutcomesData = [
  {
    programId: 1,
    employmentRate: 95,
    averageSalary: JSON.stringify({ amount: 65000, currency: "GBP" }),
    topEmployers: JSON.stringify(["Goldman Sachs", "JPMorgan", "Morgan Stanley"]),
    careerPaths: JSON.stringify(["Investment Banking", "Asset Management", "Risk Management"]),
  },
];

// Student Opportunities Data (Sample)
const studentOpportunitiesData = [
  {
    universityId: 1,
    opportunityType: "on_campus_work",
    nameEn: "Library Assistant",
    nameCn: "图书馆助理",
    hourlyRate: JSON.stringify({ amount: 10.42, currency: "GBP" }),
    requirements: JSON.stringify(["Student Status", "English Proficiency"]),
  },
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Insert ISCED-F Broad Fields
    console.log("Inserting ISCED Broad Fields...");
    const broadFieldIds = [];
    for (const field of broadFieldsData) {
      const result = await db.insert(iscedBroadFields).values(field);
      broadFieldIds.push(result[0].insertId);
    }

    // Insert ISCED-F Narrow Fields
    console.log("Inserting ISCED Narrow Fields...");
    const narrowFieldIds = [];
    for (const field of narrowFieldsData) {
      const result = await db.insert(iscedNarrowFields).values({
        ...field,
        broadFieldId: broadFieldIds[field.broadFieldId - 1],
      });
      narrowFieldIds.push(result[0].insertId);
    }

    // Insert ISCED-F Detailed Fields
    console.log("Inserting ISCED Detailed Fields...");
    for (const field of detailedFieldsData) {
      await db.insert(iscedDetailedFields).values({
        ...field,
        narrowFieldId: narrowFieldIds[field.narrowFieldId - 1],
      });
    }

    // Insert Countries
    console.log("Inserting Countries...");
    const countryIds = [];
    for (const country of countriesData) {
      const result = await db.insert(countries).values(country);
      countryIds.push(result[0].insertId);
    }

    // Insert Cities
    console.log("Inserting Cities...");
    const cityIds = [];
    for (const city of citiesData) {
      const result = await db.insert(cities).values({
        ...city,
        countryId: countryIds[city.countryId - 1],
      });
      cityIds.push(result[0].insertId);
    }

    // Insert Universities
    console.log("Inserting Universities...");
    const universityIds = [];
    for (const uni of universitiesData) {
      const result = await db.insert(universities).values({
        ...uni,
        countryId: countryIds[uni.countryId - 1],
      });
      universityIds.push(result[0].insertId);
    }

    // Insert Programs
    console.log("Inserting Programs...");
    const programIds = [];
    for (const program of programsData) {
      const result = await db.insert(programs).values({
        ...program,
        universityId: universityIds[program.universityId - 1],
        cityId: cityIds[program.cityId - 1],
        iscedDetailedFieldId: program.iscedDetailedFieldId,
      });
      programIds.push(result[0].insertId);
    }

    // Insert Tuition Fees
    console.log("Inserting Tuition Fees...");
    for (const fee of tuitionFeesData) {
      await db.insert(tuitionFees).values({
        ...fee,
        programId: programIds[fee.programId - 1],
      });
    }

    // Insert Accommodation Fees
    console.log("Inserting Accommodation Fees...");
    for (const acc of accommodationFeesData) {
      await db.insert(accommodationFees).values({
        ...acc,
        universityId: universityIds[acc.universityId - 1],
      });
    }

    // Insert Scholarships
    console.log("Inserting Scholarships...");
    for (const scholarship of scholarshipsData) {
      await db.insert(scholarships).values({
        ...scholarship,
        universityId: scholarship.universityId ? universityIds[scholarship.universityId - 1] : null,
        programId: scholarship.programId ? programIds[scholarship.programId - 1] : null,
      });
    }

    // Insert Courses
    console.log("Inserting Courses...");
    for (const course of coursesData) {
      await db.insert(courses).values({
        ...course,
        programId: programIds[course.programId - 1],
      });
    }

    // Insert Employment Outcomes
    console.log("Inserting Employment Outcomes...");
    for (const outcome of employmentOutcomesData) {
      await db.insert(employmentOutcomes).values({
        ...outcome,
        programId: programIds[outcome.programId - 1],
      });
    }

    // Insert Student Opportunities
    console.log("Inserting Student Opportunities...");
    for (const opportunity of studentOpportunitiesData) {
      await db.insert(studentOpportunities).values({
        ...opportunity,
        universityId: universityIds[opportunity.universityId - 1],
      });
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
