import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取QS大学排名数据
const qsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'qs-universities-data.json'), 'utf-8'));

// 欧洲国家和城市映射
const europeanCountries = {
  'United Kingdom': { code: 'GB', isEU: false, isSchengen: true },
  'Switzerland': { code: 'CH', isEU: false, isSchengen: true },
  'France': { code: 'FR', isEU: true, isSchengen: true },
  'Germany': { code: 'DE', isEU: true, isSchengen: true },
  'Netherlands': { code: 'NL', isEU: true, isSchengen: true },
  'Sweden': { code: 'SE', isEU: true, isSchengen: true },
  'Belgium': { code: 'BE', isEU: true, isSchengen: true },
  'Ireland': { code: 'IE', isEU: true, isSchengen: false },
};

// ISCED-F分类映射
const isced_mapping = {
  'Business Administration': { broad: '04', narrow: '041', detailed: '0412' },
  'Computer Science': { broad: '06', narrow: '061', detailed: '0613' },
  'Engineering': { broad: '07', narrow: '071', detailed: '0714' },
  'Physics': { broad: '05', narrow: '052', detailed: '0521' },
  'Finance': { broad: '04', narrow: '041', detailed: '0412' },
};

async function importUniversities() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'european_universities',
  });

  try {
    console.log('开始导入大学数据...');

    // 1. 导入国家
    console.log('导入国家数据...');
    for (const [countryName, countryData] of Object.entries(europeanCountries)) {
      await connection.execute(
        `INSERT IGNORE INTO countries (name, code, is_eu, is_schengen) VALUES (?, ?, ?, ?)`,
        [countryName, countryData.code, countryData.isEU ? 1 : 0, countryData.isSchengen ? 1 : 0]
      );
    }
    console.log('✓ 国家数据导入完成');

    // 2. 导入城市
    console.log('导入城市数据...');
    const cities = new Set();
    qsData.forEach(uni => {
      cities.add(JSON.stringify({ city: uni.city, country: uni.country }));
    });

    for (const cityStr of cities) {
      const { city, country } = JSON.parse(cityStr);
      const [countryResult] = await connection.execute(
        `SELECT id FROM countries WHERE name = ?`,
        [country]
      );
      if (countryResult.length > 0) {
        const countryId = countryResult[0].id;
        await connection.execute(
          `INSERT IGNORE INTO cities (name, country_id) VALUES (?, ?)`,
          [city, countryId]
        );
      }
    }
    console.log('✓ 城市数据导入完成');

    // 3. 导入大学
    console.log('导入大学数据...');
    for (const uni of qsData) {
      const [countryResult] = await connection.execute(
        `SELECT id FROM countries WHERE name = ?`,
        [uni.country]
      );
      
      if (countryResult.length === 0) continue;
      
      const countryId = countryResult[0].id;
      
      const [cityResult] = await connection.execute(
        `SELECT id FROM cities WHERE name = ? AND country_id = ?`,
        [uni.city, countryId]
      );
      
      const cityId = cityResult.length > 0 ? cityResult[0].id : null;

      const [uniResult] = await connection.execute(
        `INSERT INTO universities (name, country_id, city_id, website, description, type) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [
          uni.name,
          countryId,
          cityId,
          `https://www.${uni.name.toLowerCase().replace(/\s+/g, '')}.edu`,
          `${uni.name} - QS Ranking: ${uni.rank}`,
          'public'
        ]
      );

      const universityId = uniResult.insertId || uniResult[0]?.id;

      // 4. 导入排名
      if (universityId) {
        await connection.execute(
          `INSERT INTO rankings (university_id, ranking_system, rank, score) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rank = VALUES(rank), score = VALUES(score)`,
          [universityId, 'QS', uni.rank, uni.score]
        );
      }
    }
    console.log('✓ 大学数据导入完成');

    // 5. 导入示例专业
    console.log('导入示例专业数据...');
    const programs = [
      { name: 'Master of Business Administration', isced: 'Business Administration', degree: 'Master', tuition: 25000 },
      { name: 'Master of Computer Science', isced: 'Computer Science', degree: 'Master', tuition: 22000 },
      { name: 'Bachelor of Engineering', isced: 'Engineering', degree: 'Bachelor', tuition: 18000 },
      { name: 'PhD in Physics', isced: 'Physics', degree: 'PhD', tuition: 0 },
      { name: 'Master of Finance', isced: 'Finance', degree: 'Master', tuition: 28000 },
    ];

    for (let i = 0; i < Math.min(5, qsData.length); i++) {
      const uni = qsData[i];
      const [uniResult] = await connection.execute(
        `SELECT id FROM universities WHERE name = ?`,
        [uni.name]
      );

      if (uniResult.length === 0) continue;
      
      const universityId = uniResult[0].id;

      for (const program of programs) {
        const isced = isced_mapping[program.isced];
        if (!isced) continue;

        await connection.execute(
          `INSERT INTO programs (name, university_id, degree_type, isced_broad_field, isced_narrow_field, isced_detailed_field, language, tuition_per_year, currency)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            program.name,
            universityId,
            program.degree,
            isced.broad,
            isced.narrow,
            isced.detailed,
            'English',
            program.tuition,
            'EUR'
          ]
        );
      }
    }
    console.log('✓ 专业数据导入完成');

    console.log('\n✅ 所有数据导入完成！');
    console.log(`导入了 ${qsData.length} 所大学`);
    console.log(`导入了 ${cities.size} 个城市`);
    console.log(`导入了 ${Object.keys(europeanCountries).length} 个国家`);

  } catch (error) {
    console.error('导入失败:', error);
  } finally {
    await connection.end();
  }
}

// 运行导入
importUniversities().catch(console.error);
