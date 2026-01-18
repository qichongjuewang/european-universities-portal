import mysql from "mysql2/promise";

async function importData() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("开始导入真实数据...");

    // 0. 插入ISCED数据
    const [broadFields] = await connection.query(
      "SELECT id FROM isced_broad_fields LIMIT 1"
    );
    let broadFieldId;

    if (broadFields.length === 0) {
      const [result] = await connection.query(
        "INSERT INTO isced_broad_fields (code, nameEn, nameCn) VALUES (?, ?, ?)",
        ["04", "Business, administration and law", "商业、行政与法律"]
      );
      broadFieldId = result.insertId;
      console.log("创建宽泛领域: Business");
    } else {
      broadFieldId = broadFields[0].id;
    }

    const [narrowFields] = await connection.query(
      "SELECT id FROM isced_narrow_fields LIMIT 1"
    );
    let narrowFieldId;

    if (narrowFields.length === 0) {
      const [result] = await connection.query(
        "INSERT INTO isced_narrow_fields (broadFieldId, code, nameEn, nameCn) VALUES (?, ?, ?, ?)",
        [broadFieldId, "041", "Business and administration", "商业与行政"]
      );
      narrowFieldId = result.insertId;
      console.log("创建狭义领域: Business and administration");
    } else {
      narrowFieldId = narrowFields[0].id;
    }

    const [detailedFields] = await connection.query(
      "SELECT id FROM isced_detailed_fields LIMIT 1"
    );
    let iscedDetailedFieldId;

    if (detailedFields.length === 0) {
      const [result] = await connection.query(
        "INSERT INTO isced_detailed_fields (narrowFieldId, code, nameEn, nameCn) VALUES (?, ?, ?, ?)",
        [narrowFieldId, "0411", "Accounting and related fields", "会计与相关领域"]
      );
      iscedDetailedFieldId = result.insertId;
      console.log("创建详细领域: Accounting");
    } else {
      iscedDetailedFieldId = detailedFields[0].id;
    }

    // 1. 获取或创建国家
    const [countries] = await connection.query(
      "SELECT id, code FROM countries LIMIT 5"
    );
    console.log("找到国家数:", countries.length);

    if (countries.length === 0) {
      console.log("未找到国家数据，跳过专业导入");
      return;
    }

    const countryId = countries[0].id;

    // 2. 获取或创建城市
    const [cities] = await connection.query(
      "SELECT id FROM cities WHERE countryId = ? LIMIT 1",
      [countryId]
    );
    console.log("找到城市数:", cities.length);

    if (cities.length === 0) {
      // 创建城市
      await connection.query(
        "INSERT INTO cities (countryId, nameEn, nameCn) VALUES (?, ?, ?)",
        [countryId, "London", "伦敦"]
      );
      console.log("创建城市: London");
    }

    const [citiesAgain] = await connection.query(
      "SELECT id FROM cities WHERE countryId = ? LIMIT 1",
      [countryId]
    );
    const cityId = citiesAgain[0].id;

    // 3. 获取大学
    const [universities] = await connection.query(
      "SELECT id FROM universities LIMIT 1"
    );
    console.log("找到大学数:", universities.length);

    if (universities.length === 0) {
      console.log("未找到大学数据，跳过专业导入");
      return;
    }

    const universityId = universities[0].id;
    console.log("使用大学ID:", universityId);

    // 4. 插入示例专业数据
    const programsToInsert = [
      {
        universityId,
        iscedDetailedFieldId,
        nameEn: "Master of Business Administration",
        nameCn: "工商管理硕士",
        degreeType: "master",
        universityType: "public",
        durationMonths: 12,
        teachingLanguage: "English",
        admissionRequirements: "Bachelor degree, GMAT 650+",
        cityId,
      },
      {
        universityId,
        iscedDetailedFieldId,
        nameEn: "Master of Computer Science",
        nameCn: "计算机科学硕士",
        degreeType: "master",
        universityType: "public",
        durationMonths: 24,
        teachingLanguage: "English",
        admissionRequirements: "Bachelor degree in CS or related field",
        cityId,
      },
      {
        universityId,
        iscedDetailedFieldId,
        nameEn: "Bachelor of Engineering",
        nameCn: "工程学学士",
        degreeType: "bachelor",
        universityType: "public",
        durationMonths: 36,
        teachingLanguage: "English",
        admissionRequirements: "High school diploma, Math and Physics",
        cityId,
      },
      {
        universityId,
        iscedDetailedFieldId,
        nameEn: "PhD in Physics",
        nameCn: "物理学博士",
        degreeType: "phd",
        universityType: "public",
        durationMonths: 48,
        teachingLanguage: "English",
        admissionRequirements: "Master degree in Physics",
        cityId,
      },
      {
        universityId,
        iscedDetailedFieldId,
        nameEn: "Master of Finance",
        nameCn: "金融硕士",
        degreeType: "master",
        universityType: "public",
        durationMonths: 12,
        teachingLanguage: "English",
        admissionRequirements: "Bachelor degree, GMAT 700+",
        cityId,
      },
    ];

    for (const program of programsToInsert) {
      try {
        const [result] = await connection.query(
          `INSERT INTO programs 
          (universityId, iscedDetailedFieldId, cityId, nameEn, nameCn, degreeType, universityType, durationMonths, teachingLanguage, admissionRequirements) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            program.universityId,
            program.iscedDetailedFieldId,
            program.cityId,
            program.nameEn,
            program.nameCn,
            program.degreeType,
            program.universityType,
            program.durationMonths,
            program.teachingLanguage,
            program.admissionRequirements,
          ]
        );

        const programId = result.insertId;

        // 插入学费数据
        await connection.query(
          `INSERT INTO tuition_fees 
          (programId, currencyCode, annualFeeAmount, isFree, rmbExchangeRate, rmbAnnualAmount) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            programId,
            "GBP",
            25000,
            false,
            8.85,
            221250,
          ]
        );

        console.log(`✓ 插入专业: ${program.nameCn}`);
      } catch (err) {
        console.error(`✗ 插入失败: ${program.nameCn}`, err.message);
      }
    }

    console.log("✅ 数据导入完成！");
  } catch (error) {
    console.error("❌ 导入失败:", error);
  } finally {
    await connection.end();
  }
}

importData();
