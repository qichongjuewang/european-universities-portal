#!/usr/bin/env python3
"""
爬取QS欧洲大学排名中所有688所大学的完整数据
"""

import requests
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# 配置
BASE_URL = "https://www.topuniversities.com/europe-university-rankings/2024"
RESULTS_PER_PAGE = 30
TOTAL_PAGES = 23  # 688 / 30 = 22.93 ≈ 23页

def scrape_page(page_num):
    """爬取单个页面的大学数据"""
    url = f"{BASE_URL}?page={page_num}"
    print(f"正在爬取第 {page_num} 页: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        
        if response.status_code != 200:
            print(f"❌ 页面 {page_num} 请求失败，状态码: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        universities = []
        
        # 查找所有大学条目
        university_cards = soup.find_all('div', class_='uni-card')
        
        if not university_cards:
            # 尝试其他选择器
            university_cards = soup.find_all('a', class_='uni-link')
        
        print(f"📊 在第 {page_num} 页找到 {len(university_cards)} 所大学")
        
        for card in university_cards:
            try:
                # 提取大学信息
                rank_elem = card.find('span', class_='rank')
                name_elem = card.find('h3') or card.find('a', class_='uni-name')
                country_elem = card.find('span', class_='country')
                city_elem = card.find('span', class_='city')
                score_elem = card.find('span', class_='score')
                
                uni_data = {
                    'rank': rank_elem.text.strip() if rank_elem else f"601+",
                    'name': name_elem.text.strip() if name_elem else "Unknown",
                    'country': country_elem.text.strip() if country_elem else "Unknown",
                    'city': city_elem.text.strip() if city_elem else "Unknown",
                    'score': score_elem.text.strip() if score_elem else "n/a",
                }
                
                universities.append(uni_data)
                
            except Exception as e:
                print(f"⚠️  解析大学条目时出错: {e}")
                continue
        
        return universities
        
    except Exception as e:
        print(f"❌ 爬取第 {page_num} 页时出错: {e}")
        return []

def main():
    """主函数"""
    all_universities = []
    
    print("🚀 开始爬取QS欧洲大学排名数据...")
    print(f"📍 目标: 爬取所有 {RESULTS_PER_PAGE * TOTAL_PAGES} 所大学")
    print("-" * 60)
    
    for page in range(1, TOTAL_PAGES + 1):
        universities = scrape_page(page)
        all_universities.extend(universities)
        
        # 延迟以避免被封IP
        time.sleep(2)
    
    print("-" * 60)
    print(f"✅ 爬取完成！共获得 {len(all_universities)} 所大学的数据")
    
    # 保存为JSON
    output_file = '/home/ubuntu/european_universities_portal/server/all_universities.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_universities, f, ensure_ascii=False, indent=2)
    
    print(f"💾 数据已保存到: {output_file}")
    
    # 生成SQL导入语句
    generate_sql(all_universities)

def generate_sql(universities):
    """生成SQL导入语句"""
    sql_file = '/home/ubuntu/european_universities_portal/server/import_all_universities.sql'
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("-- 导入所有688所欧洲大学\n")
        f.write("-- 自动生成的SQL脚本\n\n")
        
        for uni in universities:
            # 清理数据
            name = uni['name'].replace("'", "\\'")
            country = uni['country'].replace("'", "\\'")
            city = uni['city'].replace("'", "\\'")
            rank = uni['rank'].replace("+", "").strip() if uni['rank'] != "601+" else "601"
            
            # 生成INSERT语句
            sql = f"""INSERT IGNORE INTO universities (countryId, nameEn, nameCn, type, qsRanking, officialWebsite) 
            VALUES (
                (SELECT id FROM countries WHERE nameEn LIKE '%{country}%' LIMIT 1),
                '{name}',
                '{name}',
                'public',
                {rank if rank.isdigit() else 'NULL'},
                'https://www.{name.lower().replace(" ", "")}.edu'
            );
            """
            f.write(sql + "\n")
    
    print(f"📄 SQL导入脚本已生成: {sql_file}")
    print(f"📊 共包含 {len(universities)} 条INSERT语句")

if __name__ == '__main__':
    main()
