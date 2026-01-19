#!/usr/bin/env python3
"""
欧洲大学和专业数据爬取脚本

功能：
1. 爬取QS、Times、ARWU排名中的欧洲大学
2. 爬取每所大学的专业信息
3. 爬取学费、住宿、奖学金等信息
4. 导出为JSON格式供导入脚本使用
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
from typing import List, Dict, Optional
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 请求头
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# 欧洲国家列表
EUROPEAN_COUNTRIES = [
    'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
    'Switzerland', 'Sweden', 'Belgium', 'Austria', 'Denmark', 'Norway',
    'Finland', 'Ireland', 'Portugal', 'Poland', 'Czech Republic', 'Greece',
    'Hungary', 'Romania', 'Croatia', 'Bulgaria', 'Slovakia', 'Lithuania',
    'Slovenia', 'Latvia', 'Estonia', 'Luxembourg', 'Cyprus', 'Malta'
]

def delay():
    """随机延迟，避免被封IP"""
    time.sleep(random.uniform(1, 3))

def scrape_qs_rankings() -> List[Dict]:
    """
    爬取QS世界大学排名中的欧洲大学
    
    返回格式：
    [
        {
            'name': '大学名称',
            'country': '国家',
            'qs_ranking': QS排名,
            'website': '官网URL'
        },
        ...
    ]
    """
    logger.info("开始爬取QS排名...")
    universities = []
    
    # QS排名API或网页URL
    # 注意：实际使用时需要替换为真实的QS排名数据源
    url = "https://www.topuniversities.com/university-rankings/world-university-rankings/2024"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 这里需要根据实际网页结构解析数据
        # 示例代码（需要根据实际情况调整）
        # for row in soup.select('.ranking-row'):
        #     name = row.select_one('.university-name').text.strip()
        #     country = row.select_one('.country').text.strip()
        #     ranking = int(row.select_one('.rank').text.strip())
        #     
        #     if country in EUROPEAN_COUNTRIES:
        #         universities.append({
        #             'name': name,
        #             'country': country,
        #             'qs_ranking': ranking,
        #             'website': ''
        #         })
        
        logger.info(f"QS排名爬取完成，找到 {len(universities)} 所欧洲大学")
        
    except Exception as e:
        logger.error(f"爬取QS排名失败: {e}")
    
    delay()
    return universities

def scrape_times_rankings() -> List[Dict]:
    """
    爬取Times Higher Education排名中的欧洲大学
    
    返回格式同scrape_qs_rankings
    """
    logger.info("开始爬取Times排名...")
    universities = []
    
    # Times排名URL
    url = "https://www.timeshighereducation.com/world-university-rankings/2024/world-ranking"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 解析逻辑（需要根据实际情况调整）
        
        logger.info(f"Times排名爬取完成，找到 {len(universities)} 所欧洲大学")
        
    except Exception as e:
        logger.error(f"爬取Times排名失败: {e}")
    
    delay()
    return universities

def scrape_arwu_rankings() -> List[Dict]:
    """
    爬取ARWU（上海排名）中的欧洲大学
    
    返回格式同scrape_qs_rankings
    """
    logger.info("开始爬取ARWU排名...")
    universities = []
    
    # ARWU排名URL
    url = "http://www.shanghairanking.com/rankings/arwu/2023"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 解析逻辑（需要根据实际情况调整）
        
        logger.info(f"ARWU排名爬取完成，找到 {len(universities)} 所欧洲大学")
        
    except Exception as e:
        logger.error(f"爬取ARWU排名失败: {e}")
    
    delay()
    return universities

def merge_university_data(qs_data: List[Dict], times_data: List[Dict], arwu_data: List[Dict]) -> List[Dict]:
    """
    合并三个排名的大学数据，去重并整合排名信息
    """
    logger.info("合并大学数据...")
    
    # 使用字典去重，以大学名称为key
    merged = {}
    
    for uni in qs_data:
        name = uni['name']
        if name not in merged:
            merged[name] = {
                'name': name,
                'country': uni['country'],
                'qs_ranking': uni.get('qs_ranking'),
                'times_ranking': None,
                'arwu_ranking': None,
                'website': uni.get('website', '')
            }
    
    for uni in times_data:
        name = uni['name']
        if name in merged:
            merged[name]['times_ranking'] = uni.get('times_ranking')
        else:
            merged[name] = {
                'name': name,
                'country': uni['country'],
                'qs_ranking': None,
                'times_ranking': uni.get('times_ranking'),
                'arwu_ranking': None,
                'website': uni.get('website', '')
            }
    
    for uni in arwu_data:
        name = uni['name']
        if name in merged:
            merged[name]['arwu_ranking'] = uni.get('arwu_ranking')
        else:
            merged[name] = {
                'name': name,
                'country': uni['country'],
                'qs_ranking': None,
                'times_ranking': None,
                'arwu_ranking': uni.get('arwu_ranking'),
                'website': uni.get('website', '')
            }
    
    result = list(merged.values())
    logger.info(f"合并完成，共 {len(result)} 所欧洲大学")
    return result

def scrape_university_programs(university_name: str, university_website: str) -> List[Dict]:
    """
    爬取指定大学的专业信息
    
    参数：
        university_name: 大学名称
        university_website: 大学官网URL
    
    返回格式：
    [
        {
            'program_name': '专业名称',
            'degree_type': 'bachelor/master/phd',
            'duration_months': 学制（月）,
            'tuition_fee': 学费,
            'currency': '货币',
            'language': ['教学语言'],
            'description': '描述'
        },
        ...
    ]
    """
    logger.info(f"爬取 {university_name} 的专业信息...")
    programs = []
    
    if not university_website:
        logger.warning(f"{university_name} 没有官网URL，跳过")
        return programs
    
    try:
        # 尝试访问大学官网的专业列表页面
        # 这里需要根据不同大学的网站结构进行调整
        response = requests.get(university_website, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        # 解析逻辑（需要根据实际情况调整）
        
        logger.info(f"{university_name} 找到 {len(programs)} 个专业")
        
    except Exception as e:
        logger.error(f"爬取 {university_name} 专业信息失败: {e}")
    
    delay()
    return programs

def save_to_json(data: Dict, filename: str):
    """保存数据到JSON文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"数据已保存到 {filename}")

def main():
    """主函数"""
    logger.info("=" * 50)
    logger.info("开始爬取欧洲大学和专业数据")
    logger.info("=" * 50)
    
    # 1. 爬取排名数据
    qs_universities = scrape_qs_rankings()
    times_universities = scrape_times_rankings()
    arwu_universities = scrape_arwu_rankings()
    
    # 2. 合并大学数据
    all_universities = merge_university_data(qs_universities, times_universities, arwu_universities)
    
    # 3. 保存大学数据
    save_to_json({
        'universities': all_universities,
        'total_count': len(all_universities)
    }, 'data/universities.json')
    
    # 4. 爬取每所大学的专业信息
    all_programs = []
    for i, uni in enumerate(all_universities, 1):
        logger.info(f"进度: {i}/{len(all_universities)}")
        programs = scrape_university_programs(uni['name'], uni['website'])
        
        for program in programs:
            program['university_name'] = uni['name']
            program['country'] = uni['country']
            all_programs.append(program)
        
        # 每10所大学保存一次，防止数据丢失
        if i % 10 == 0:
            save_to_json({
                'programs': all_programs,
                'total_count': len(all_programs)
            }, f'data/programs_checkpoint_{i}.json')
    
    # 5. 保存所有专业数据
    save_to_json({
        'programs': all_programs,
        'total_count': len(all_programs)
    }, 'data/programs.json')
    
    logger.info("=" * 50)
    logger.info("爬取完成！")
    logger.info(f"共爬取 {len(all_universities)} 所大学")
    logger.info(f"共爬取 {len(all_programs)} 个专业")
    logger.info("=" * 50)

if __name__ == '__main__':
    main()
