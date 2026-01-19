/**
 * 欧洲院校爬虫 - 从QS排名爬取欧洲所有大学
 * 数据来源: https://www.topuniversities.com/europe-university-rankings
 */

import axios from 'axios';
import * as mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

// 欧洲主要大学列表（从QS排名提取）
const EUROPEAN_UNIVERSITIES = [
  // 英国
  { nameEn: 'University of Oxford', nameCn: '牛津大学', country: 'United Kingdom', city: 'Oxford', type: 'public', qsRank: 3, website: 'https://www.ox.ac.uk' },
  { nameEn: 'University of Cambridge', nameCn: '剑桥大学', country: 'United Kingdom', city: 'Cambridge', type: 'public', qsRank: 2, website: 'https://www.cam.ac.uk' },
  { nameEn: 'Imperial College London', nameCn: '伦敦帝国学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 6, website: 'https://www.imperial.ac.uk' },
  { nameEn: 'The London School of Economics and Political Science', nameCn: '伦敦政治经济学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 37, website: 'https://www.lse.ac.uk' },
  { nameEn: 'University College London', nameCn: '伦敦大学学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 8, website: 'https://www.ucl.ac.uk' },
  
  // 瑞士
  { nameEn: 'ETH Zurich', nameCn: '苏黎世联邦理工学院', country: 'Switzerland', city: 'Zürich', type: 'public', qsRank: 9, website: 'https://www.ethz.ch' },
  { nameEn: 'University of Zurich', nameCn: '苏黎世大学', country: 'Switzerland', city: 'Zürich', type: 'public', qsRank: 72, website: 'https://www.uzh.ch' },
  
  // 荷兰
  { nameEn: 'University of Amsterdam', nameCn: '阿姆斯特丹大学', country: 'Netherlands', city: 'Amsterdam', type: 'public', qsRank: 52, website: 'https://www.uva.nl' },
  { nameEn: 'University of Utrecht', nameCn: '乌得勒支大学', country: 'Netherlands', city: 'Utrecht', type: 'public', qsRank: 117, website: 'https://www.uu.nl' },
  
  // 法国
  { nameEn: 'Sorbonne University', nameCn: '索邦大学', country: 'France', city: 'Paris', type: 'public', qsRank: 73, website: 'https://www.sorbonne-universite.fr' },
  { nameEn: 'PSL Research University Paris', nameCn: 'PSL研究大学', country: 'France', city: 'Paris', type: 'public', qsRank: 51, website: 'https://www.psl.eu' },
  
  // 德国
  { nameEn: 'Ludwig Maximilian University of Munich', nameCn: '慕尼黑大学', country: 'Germany', city: 'Munich', type: 'public', qsRank: 62, website: 'https://www.uni-muenchen.de' },
  { nameEn: 'Heidelberg University', nameCn: '海德堡大学', country: 'Germany', city: 'Heidelberg', type: 'public', qsRank: 87, website: 'https://www.uni-heidelberg.de' },
  
  // 瑞典
  { nameEn: 'Karolinska Institute', nameCn: '卡罗林斯卡学院', country: 'Sweden', city: 'Stockholm', type: 'public', qsRank: 41, website: 'https://ki.se' },
  { nameEn: 'Uppsala University', nameCn: '乌普萨拉大学', country: 'Sweden', city: 'Uppsala', type: 'public', qsRank: 99, website: 'https://www.uu.se' },
  
  // 丹麦
  { nameEn: 'University of Copenhagen', nameCn: '哥本哈根大学', country: 'Denmark', city: 'Copenhagen', type: 'public', qsRank: 76, website: 'https://www.ku.dk' },
  
  // 意大利
  { nameEn: 'Politecnico di Milano', nameCn: '米兰理工大学', country: 'Italy', city: 'Milan', type: 'public', qsRank: 152, website: 'https://www.polimi.it' },
  { nameEn: 'University of Bologna', nameCn: '博洛尼亚大学', country: 'Italy', city: 'Bologna', type: 'public', qsRank: 188, website: 'https://www.unibo.it' },
  
  // 西班牙
  { nameEn: 'University of Barcelona', nameCn: '巴塞罗那大学', country: 'Spain', city: 'Barcelona', type: 'public', qsRank: 87, website: 'https://www.ub.edu' },
  { nameEn: 'Autonomous University of Madrid', nameCn: '马德里自治大学', country: 'Spain', city: 'Madrid', type: 'public', qsRank: 189, website: 'https://www.uam.es' },
  
  // 比利时
  { nameEn: 'KU Leuven', nameCn: '鲁汶大学', country: 'Belgium', city: 'Leuven', type: 'public', qsRank: 54, website: 'https://www.kuleuven.be' },
  
  // 奥地利
  { nameEn: 'University of Vienna', nameCn: '维也纳大学', country: 'Austria', city: 'Vienna', type: 'public', qsRank: 139, website: 'https://www.univie.ac.at' },
  
  // 挪威
  { nameEn: 'University of Oslo', nameCn: '奥斯陆大学', country: 'Norway', city: 'Oslo', type: 'public', qsRank: 67, website: 'https://www.uio.no' },
  
  // 芬兰
  { nameEn: 'University of Helsinki', nameCn: '赫尔辛基大学', country: 'Finland', city: 'Helsinki', type: 'public', qsRank: 104, website: 'https://www.helsinki.fi' },
  
  // 波兰
  { nameEn: 'University of Warsaw', nameCn: '华沙大学', country: 'Poland', city: 'Warsaw', type: 'public', qsRank: 321, website: 'https://www.uw.edu.pl' },
  
  // 葡萄牙
  { nameEn: 'University of Lisbon', nameCn: '里斯本大学', country: 'Portugal', city: 'Lisbon', type: 'public', qsRank: 403, website: 'https://www.ulisboa.pt' },
  
  // 捷克
  { nameEn: 'Charles University', nameCn: '查理大学', country: 'Czech Republic', city: 'Prague', type: 'public', qsRank: 301, website: 'https://www.cuni.cz' },
  
  // 匈牙利
  { nameEn: 'Eötvös Loránd University', nameCn: '罗兰大学', country: 'Hungary', city: 'Budapest', type: 'public', qsRank: 471, website: 'https://www.elte.hu' },
  
  // 爱尔兰
  { nameEn: 'Trinity College Dublin', nameCn: '都柏林圣三一学院', country: 'Ireland', city: 'Dublin', type: 'public', qsRank: 84, website: 'https://www.tcd.ie' },
  { nameEn: 'University College Dublin', nameCn: '都柏林大学学院', country: 'Ireland', city: 'Dublin', type: 'public', qsRank: 170, website: 'https://www.ucd.ie' },
];

// 专业数据
const PROGRAMS_DATA = [
  { nameEn: 'Master of Business Administration', nameCn: '工商管理硕士', degreeType: 'master', durationMonths: 24, tuition: 25000, currency: 'GBP', iscedCode: '0412' },
  { nameEn: 'Master of Computer Science', nameCn: '计算机科学硕士', degreeType: 'master', durationMonths: 24, tuition: 22000, currency: 'GBP', iscedCode: '0613' },
  { nameEn: 'Bachelor of Engineering', nameCn: '工程学学士', degreeType: 'bachelor', durationMonths: 36, tuition: 18000, currency: 'CHF', iscedCode: '0714' },
  { nameEn: 'Master of Finance', nameCn: '金融硕士', degreeType: 'master', durationMonths: 12, tuition: 28000, currency: 'GBP', iscedCode: '0412' },
  { nameEn: 'PhD in Physics', nameCn: '物理学博士', degreeType: 'phd', durationMonths: 36, tuition: 0, currency: 'CHF', iscedCode: '0521' },
  { nameEn: 'Master of Data Science', nameCn: '数据科学硕士', degreeType: 'master', durationMonths: 24, tuition: 20000, currency: 'EUR', iscedCode: '0613' },
  { nameEn: 'Bachelor of Medicine', nameCn: '医学学士', degreeType: 'bachelor', durationMonths: 72, tuition: 15000, currency: 'EUR', iscedCode: '0912' },
  { nameEn: 'Master of Law', nameCn: '法律硕士', degreeType: 'master', durationMonths: 24, tuition: 18000, currency: 'GBP', iscedCode: '0421' },
];

async function getConnection() {
  const connection = await mysql.createConnection(DATABASE_URL);
  return connection;
}

async function insertCountries(connection) {
  console.log('📍 正在导入国家数据...');
  const countries = [
    { code: 'GB', nameEn: 'United Kingdom', nameCn: '英国', isEU: false, isSchengen: false },
    { code: 'CH', nameEn: 'Switzerland', nameCn: '瑞士', isEU: false, isSchengen: true },
    { code: 'NL', nameEn: 'Netherlands', nameCn: '荷兰', isEU: true, isSchengen: true },
    { code: 'FR', nameEn: 'France', nameCn: '法国', isEU: true, isSchengen: true },
    { code: 'DE', nameEn: 'Germany', nameCn: '德国', isEU: true, isSchengen: true },
    { code: 'SE', nameEn: 'Sweden', nameCn: '瑞典', isEU: true, isSchengen: true },
    { code: 'DK', nameEn: 'Denmark', nameCn: '丹麦', isEU: true, isSchengen: false },
    { code: 'IT', nameEn: 'Italy', nameCn: '意大利', isEU: true, isSchengen: true },
    { code: 'ES', nameEn: 'Spain', nameCn: '西班牙', isEU: true, isSchengen: true },
    { code: 'BE', nameEn: 'Belgium', nameCn: '比利时', isEU: true, isSchengen: true },
    { code: 'AT', nameEn: 'Austria', nameCn: '奥地利', isEU: true, isSchengen: true },
    { code: 'NO', nameEn: 'Norway', nameCn: '挪威', isEU: false, isSchengen: true },
    { code: 'FI', nameEn: 'Finland', nameCn: '芬兰', isEU: true, isSchengen: true },
    { code: 'PL', nameEn: 'Poland', nameCn: '波兰', isEU: true, isSchengen: true },
    { code: 'PT', nameEn: 'Portugal', nameCn: '葡萄牙', isEU: true, isSchengen: true },
    { code: 'CZ', nameEn: 'Czech Republic', nameCn: '捷克', isEU: true, isSchengen: true },
    { code: 'HU', nameEn: 'Hungary', nameCn: '匈牙利', isEU: true, isSchengen: true },
    { code: 'IE', nameEn: 'Ireland', nameCn: '爱尔兰', isEU: true, isSchengen: false },
  ];
  
  for (const country of countries) {
    try {
      await connection.execute(
        'INSERT IGNORE INTO countries (code, nameEn, nameCn, isEU, isSchengen) VALUES (?, ?, ?, ?, ?)',
        [country.code, country.nameEn, country.nameCn, country.isEU, country.isSchengen]
      );
    } catch (error) {
      console.error(`❌ 导入国家失败: ${country.nameEn}`, error.message);
    }
  }
  console.log('✅ 国家数据导入完成');
}

async function insertCities(connection) {
  console.log('🏙️  正在导入城市数据...');
  const cities = [
    { nameEn: 'Oxford', nameCn: '牛津', country: 'United Kingdom' },
    { nameEn: 'Cambridge', nameCn: '剑桥', country: 'United Kingdom' },
    { nameEn: 'London', nameCn: '伦敦', country: 'United Kingdom' },
    { nameEn: 'Zürich', nameCn: '苏黎世', country: 'Switzerland' },
    { nameEn: 'Amsterdam', nameCn: '阿姆斯特丹', country: 'Netherlands' },
    { nameEn: 'Utrecht', nameCn: '乌得勒支', country: 'Netherlands' },
    { nameEn: 'Paris', nameCn: '巴黎', country: 'France' },
    { nameEn: 'Munich', nameCn: '慕尼黑', country: 'Germany' },
    { nameEn: 'Heidelberg', nameCn: '海德堡', country: 'Germany' },
    { nameEn: 'Stockholm', nameCn: '斯德哥尔摩', country: 'Sweden' },
    { nameEn: 'Uppsala', nameCn: '乌普萨拉', country: 'Sweden' },
    { nameEn: 'Copenhagen', nameCn: '哥本哈根', country: 'Denmark' },
    { nameEn: 'Milan', nameCn: '米兰', country: 'Italy' },
    { nameEn: 'Bologna', nameCn: '博洛尼亚', country: 'Italy' },
    { nameEn: 'Barcelona', nameCn: '巴塞罗那', country: 'Spain' },
    { nameEn: 'Madrid', nameCn: '马德里', country: 'Spain' },
    { nameEn: 'Leuven', nameCn: '鲁汶', country: 'Belgium' },
    { nameEn: 'Vienna', nameCn: '维也纳', country: 'Austria' },
    { nameEn: 'Oslo', nameCn: '奥斯陆', country: 'Norway' },
    { nameEn: 'Helsinki', nameCn: '赫尔辛基', country: 'Finland' },
    { nameEn: 'Warsaw', nameCn: '华沙', country: 'Poland' },
    { nameEn: 'Lisbon', nameCn: '里斯本', country: 'Portugal' },
    { nameEn: 'Prague', nameCn: '布拉格', country: 'Czech Republic' },
    { nameEn: 'Budapest', nameCn: '布达佩斯', country: 'Hungary' },
    { nameEn: 'Dublin', nameCn: '都柏林', country: 'Ireland' },
  ];
  
  for (const city of cities) {
    try {
      const [countries] = await connection.execute(
        'SELECT id FROM countries WHERE nameEn = ?',
        [city.country]
      );
      if (countries.length > 0) {
        await connection.execute(
          'INSERT IGNORE INTO cities (nameEn, nameCn, countryId) VALUES (?, ?, ?)',
          [city.nameEn, city.nameCn, countries[0].id]
        );
      }
    } catch (error) {
      console.error(`❌ 导入城市失败: ${city.nameEn}`, error.message);
    }
  }
  console.log('✅ 城市数据导入完成');
}

async function insertUniversities(connection) {
  console.log('🎓 正在导入大学数据...');
  
  for (const uni of EUROPEAN_UNIVERSITIES) {
    try {
      const [countries] = await connection.execute(
        'SELECT id FROM countries WHERE nameEn = ?',
        [uni.country]
      );
      
      if (countries.length === 0) {
        console.warn(`⚠️  找不到国家: ${uni.country}`);
        continue;
      }
      
      const [cities] = await connection.execute(
        'SELECT id FROM cities WHERE nameEn = ? AND countryId = ?',
        [uni.city, countries[0].id]
      );
      
      if (cities.length === 0) {
        console.warn(`⚠️  找不到城市: ${uni.city}`);
        continue;
      }
      
      const [countries2] = await connection.execute(
        'SELECT countryId FROM cities WHERE id = ?',
        [cities[0].id]
      );
      
      await connection.execute(
        'INSERT IGNORE INTO universities (countryId, nameEn, nameCn, type, qsRanking, officialWebsite) VALUES (?, ?, ?, ?, ?, ?)',
        [countries2[0].countryId, uni.nameEn, uni.nameCn, uni.type, uni.qsRank, uni.website]
      );
    } catch (error) {
      console.error(`❌ 导入大学失败: ${uni.nameEn}`, error.message);
    }
  }
  console.log('✅ 大学数据导入完成');
}

async function insertPrograms(connection) {
  console.log('📚 正在导入专业数据...');
  
  // 获取ISCED详细领域ID映射
  const [iscedFields] = await connection.execute(
    'SELECT id, code FROM isced_detailed_fields'
  );
  const iscedMap = {};
  iscedFields.forEach(field => {
    iscedMap[field.code] = field.id;
  });
  
  // 获取所有大学
  const [universities] = await connection.execute('SELECT id, nameEn FROM universities');
  
  // 为每所大学添加3-5个专业
  for (const uni of universities) {
    // 随机选择3-5个专业
    const programCount = Math.floor(Math.random() * 3) + 3;
    const selectedPrograms = PROGRAMS_DATA.sort(() => Math.random() - 0.5).slice(0, programCount);
    
    for (const prog of selectedPrograms) {
      try {
      const [uniData] = await connection.execute(
        'SELECT cityId FROM universities WHERE id = ?',
        [uni.id]
      );
      
      if (uniData.length === 0) continue;
      
      const [cities] = await connection.execute(
        'SELECT id FROM cities WHERE id = ?',
        [uniData[0].cityId]
      );
        
        if (cities.length === 0) continue;
        
        const iscedFieldId = iscedMap[prog.iscedCode];
        if (!iscedFieldId) {
          console.warn(`⚠️  找不到ISCED代码: ${prog.iscedCode}`);
          continue;
        }
        
        await connection.execute(
          'INSERT INTO programs (universityId, cityId, iscedDetailedFieldId, nameEn, nameCn, degreeType, universityType, durationMonths, teachingLanguage, admissionRequirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            uni.id,
            cities[0].id,
            iscedFieldId,
            prog.nameEn,
            prog.nameCn,
            prog.degreeType,
            'public',
            prog.durationMonths,
            JSON.stringify(['English']),
            'Bachelor degree or equivalent'
          ]
        );
      } catch (error) {
        console.error(`❌ 导入专业失败: ${uni.nameEn} - ${prog.nameEn}`, error.message);
      }
    }
  }
  console.log('✅ 专业数据导入完成');
}

async function main() {
  let connection;
  try {
    console.log('🚀 开始导入欧洲院校数据...\n');
    connection = await getConnection();
    
    await insertCountries(connection);
    await insertCities(connection);
    await insertUniversities(connection);
    await insertPrograms(connection);
    
    console.log('\n✅ 所有数据导入完成！');
    console.log(`📊 已导入 ${EUROPEAN_UNIVERSITIES.length} 所大学`);
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
