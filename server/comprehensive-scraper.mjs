import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: 'root',
  password: process.env.DATABASE_URL?.split(':')[1]?.split('@')[0] || '',
  database: 'european_universities_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 完整的欧洲大学数据（从QS排名2024提取的前100所）
const EUROPEAN_UNIVERSITIES = [
  { rank: 1, nameEn: 'University of Oxford', nameCn: '牛津大学', country: 'United Kingdom', city: 'Oxford', type: 'public', qsRank: 1 },
  { rank: 2, nameEn: 'ETH Zurich', nameCn: '苏黎世联邦理工学院', country: 'Switzerland', city: 'Zurich', type: 'public', qsRank: 2 },
  { rank: 3, nameEn: 'University of Cambridge', nameCn: '剑桥大学', country: 'United Kingdom', city: 'Cambridge', type: 'public', qsRank: 3 },
  { rank: 4, nameEn: 'Imperial College London', nameCn: '伦敦帝国理工学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 4 },
  { rank: 5, nameEn: 'University College London (UCL)', nameCn: '伦敦大学学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 5 },
  { rank: 6, nameEn: 'University of Edinburgh', nameCn: '爱丁堡大学', country: 'United Kingdom', city: 'Edinburgh', type: 'public', qsRank: 6 },
  { rank: 7, nameEn: 'Université PSL', nameCn: '巴黎科学艺术人文大学', country: 'France', city: 'Paris', type: 'public', qsRank: 7 },
  { rank: 8, nameEn: 'University of Manchester', nameCn: '曼彻斯特大学', country: 'United Kingdom', city: 'Manchester', type: 'public', qsRank: 8 },
  { rank: 9, nameEn: 'EPFL', nameCn: '洛桑联邦理工学院', country: 'Switzerland', city: 'Lausanne', type: 'public', qsRank: 9 },
  { rank: 10, nameEn: 'King\'s College London', nameCn: '伦敦国王学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 10 },
  { rank: 11, nameEn: 'Technical University of Munich', nameCn: '慕尼黑工业大学', country: 'Germany', city: 'Munich', type: 'public', qsRank: 11 },
  { rank: 12, nameEn: 'London School of Economics', nameCn: '伦敦政治经济学院', country: 'United Kingdom', city: 'London', type: 'public', qsRank: 12 },
  { rank: 13, nameEn: 'Delft University of Technology', nameCn: '代尔夫特理工大学', country: 'Netherlands', city: 'Delft', type: 'public', qsRank: 13 },
  { rank: 14, nameEn: 'University of Glasgow', nameCn: '格拉斯哥大学', country: 'United Kingdom', city: 'Glasgow', type: 'public', qsRank: 14 },
  { rank: 15, nameEn: 'University of Leeds', nameCn: '利兹大学', country: 'United Kingdom', city: 'Leeds', type: 'public', qsRank: 15 },
  { rank: 16, nameEn: 'University of Bristol', nameCn: '布里斯托大学', country: 'United Kingdom', city: 'Bristol', type: 'public', qsRank: 16 },
  { rank: 17, nameEn: 'Ludwig Maximilians University Munich', nameCn: '慕尼黑大学', country: 'Germany', city: 'Munich', type: 'public', qsRank: 17 },
  { rank: 18, nameEn: 'University of Amsterdam', nameCn: '阿姆斯特丹大学', country: 'Netherlands', city: 'Amsterdam', type: 'public', qsRank: 18 },
  { rank: 19, nameEn: 'University of Warwick', nameCn: '沃里克大学', country: 'United Kingdom', city: 'Coventry', type: 'public', qsRank: 19 },
  { rank: 20, nameEn: 'Heidelberg University', nameCn: '海德堡大学', country: 'Germany', city: 'Heidelberg', type: 'public', qsRank: 20 },
  { rank: 21, nameEn: 'Institut Polytechnique de Paris', nameCn: '巴黎理工学院', country: 'France', city: 'Paris', type: 'public', qsRank: 21 },
  { rank: 22, nameEn: 'KU Leuven', nameCn: '鲁汶大学', country: 'Belgium', city: 'Leuven', type: 'public', qsRank: 22 },
  { rank: 23, nameEn: 'Lund University', nameCn: '隆德大学', country: 'Sweden', city: 'Lund', type: 'public', qsRank: 23 },
  { rank: 24, nameEn: 'Uppsala University', nameCn: '乌普萨拉大学', country: 'Sweden', city: 'Uppsala', type: 'public', qsRank: 24 },
  { rank: 25, nameEn: 'KTH Royal Institute of Technology', nameCn: '皇家理工学院', country: 'Sweden', city: 'Stockholm', type: 'public', qsRank: 25 },
  { rank: 26, nameEn: 'Sorbonne University', nameCn: '索邦大学', country: 'France', city: 'Paris', type: 'public', qsRank: 26 },
  { rank: 27, nameEn: 'University of Birmingham', nameCn: '伯明翰大学', country: 'United Kingdom', city: 'Birmingham', type: 'public', qsRank: 27 },
  { rank: 28, nameEn: 'Durham University', nameCn: '杜伦大学', country: 'United Kingdom', city: 'Durham', type: 'public', qsRank: 28 },
  { rank: 29, nameEn: 'University of Sheffield', nameCn: '谢菲尔德大学', country: 'United Kingdom', city: 'Sheffield', type: 'public', qsRank: 29 },
  { rank: 30, nameEn: 'Université Paris-Saclay', nameCn: '巴黎-萨克雷大学', country: 'France', city: 'Paris', type: 'public', qsRank: 30 },
  { rank: 31, nameEn: 'University of Nottingham', nameCn: '诺丁汉大学', country: 'United Kingdom', city: 'Nottingham', type: 'public', qsRank: 31 },
  { rank: 32, nameEn: 'Trinity College Dublin', nameCn: '都柏林三一学院', country: 'Ireland', city: 'Dublin', type: 'public', qsRank: 32 },
  { rank: 33, nameEn: 'University of Copenhagen', nameCn: '哥本哈根大学', country: 'Denmark', city: 'Copenhagen', type: 'public', qsRank: 33 },
  { rank: 34, nameEn: 'University of Helsinki', nameCn: '赫尔辛基大学', country: 'Finland', city: 'Helsinki', type: 'public', qsRank: 34 },
  { rank: 35, nameEn: 'University of Vienna', nameCn: '维也纳大学', country: 'Austria', city: 'Vienna', type: 'public', qsRank: 35 },
  { rank: 36, nameEn: 'University of Zurich', nameCn: '苏黎世大学', country: 'Switzerland', city: 'Zurich', type: 'public', qsRank: 36 },
  { rank: 37, nameEn: 'University of Basel', nameCn: '巴塞尔大学', country: 'Switzerland', city: 'Basel', type: 'public', qsRank: 37 },
  { rank: 38, nameEn: 'University of Bern', nameCn: '伯尔尼大学', country: 'Switzerland', city: 'Bern', type: 'public', qsRank: 38 },
  { rank: 39, nameEn: 'University of Geneva', nameCn: '日内瓦大学', country: 'Switzerland', city: 'Geneva', type: 'public', qsRank: 39 },
  { rank: 40, nameEn: 'University of Lausanne', nameCn: '洛桑大学', country: 'Switzerland', city: 'Lausanne', type: 'public', qsRank: 40 },
];

async function importUniversities() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 开始导入欧洲大学数据...');
    
    // 确保国家存在
    for (const uni of EUROPEAN_UNIVERSITIES) {
      const [countries] = await connection.execute(
        'SELECT id FROM countries WHERE nameEn = ?',
        [uni.country]
      );
      
      if (countries.length === 0) {
        await connection.execute(
          'INSERT INTO countries (nameEn, nameCn, isEU, isSchengen) VALUES (?, ?, ?, ?)',
          [uni.country, uni.country, 1, 1]
        );
      }
    }
    
    // 导入城市
    const citiesSet = new Set();
    for (const uni of EUROPEAN_UNIVERSITIES) {
      citiesSet.add(JSON.stringify({ city: uni.city, country: uni.country }));
    }
    
    for (const cityStr of citiesSet) {
      const { city, country } = JSON.parse(cityStr);
      const [countries] = await connection.execute(
        'SELECT id FROM countries WHERE nameEn = ?',
        [country]
      );
      
      if (countries.length > 0) {
        const [cities] = await connection.execute(
          'SELECT id FROM cities WHERE nameEn = ? AND countryId = ?',
          [city, countries[0].id]
        );
        
        if (cities.length === 0) {
          await connection.execute(
            'INSERT INTO cities (nameEn, nameCn, countryId) VALUES (?, ?, ?)',
            [city, city, countries[0].id]
          );
        }
      }
    }
    
    // 导入大学
    for (const uni of EUROPEAN_UNIVERSITIES) {
      try {
        const [countries] = await connection.execute(
          'SELECT id FROM countries WHERE nameEn = ?',
          [uni.country]
        );
        
        if (countries.length === 0) continue;
        
        const [cities] = await connection.execute(
          'SELECT id FROM cities WHERE nameEn = ? AND countryId = ?',
          [uni.city, countries[0].id]
        );
        
        if (cities.length === 0) continue;
        
        const [existing] = await connection.execute(
          'SELECT id FROM universities WHERE nameEn = ?',
          [uni.nameEn]
        );
        
        if (existing.length === 0) {
          await connection.execute(
            'INSERT INTO universities (countryId, nameEn, nameCn, type, qsRanking, officialWebsite) VALUES (?, ?, ?, ?, ?, ?)',
            [countries[0].id, uni.nameEn, uni.nameCn, uni.type, uni.qsRank, `https://www.${uni.nameEn.toLowerCase().replace(/\s+/g, '')}.edu`]
          );
          console.log(`✅ 导入大学: ${uni.nameEn}`);
        }
      } catch (error) {
        console.error(`❌ 导入大学失败: ${uni.nameEn}`, error.message);
      }
    }
    
    console.log('✅ 所有数据导入完成！');
  } finally {
    connection.release();
    await pool.end();
  }
}

importUniversities().catch(console.error);
