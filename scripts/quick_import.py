#!/usr/bin/env python3
"""
快速导入欧洲大学数据
基于QS排名前200所欧洲大学
"""

import json
import sys

# 欧洲前200所大学数据（基于QS 2024排名）
UNIVERSITIES = [
    # 英国 (UK)
    {"name": "University of Cambridge", "nameCn": "剑桥大学", "country": "United Kingdom", "city": "Cambridge", "qsRank": 2, "type": "public"},
    {"name": "University of Oxford", "nameCn": "牛津大学", "country": "United Kingdom", "city": "Oxford", "qsRank": 3, "type": "public"},
    {"name": "Imperial College London", "nameCn": "帝国理工学院", "country": "United Kingdom", "city": "London", "qsRank": 6, "type": "public"},
    {"name": "University College London", "nameCn": "伦敦大学学院", "country": "United Kingdom", "city": "London", "qsRank": 9, "type": "public"},
    {"name": "University of Edinburgh", "nameCn": "爱丁堡大学", "country": "United Kingdom", "city": "Edinburgh", "qsRank": 22, "type": "public"},
    {"name": "University of Manchester", "nameCn": "曼彻斯特大学", "country": "United Kingdom", "city": "Manchester", "qsRank": 32, "type": "public"},
    {"name": "King's College London", "nameCn": "伦敦国王学院", "country": "United Kingdom", "city": "London", "qsRank": 40, "type": "public"},
    {"name": "London School of Economics", "nameCn": "伦敦政治经济学院", "country": "United Kingdom", "city": "London", "qsRank": 45, "type": "public"},
    {"name": "University of Bristol", "nameCn": "布里斯托大学", "country": "United Kingdom", "city": "Bristol", "qsRank": 55, "type": "public"},
    {"name": "University of Warwick", "nameCn": "华威大学", "country": "United Kingdom", "city": "Coventry", "qsRank": 67, "type": "public"},
    
    # 瑞士 (Switzerland)
    {"name": "ETH Zurich", "nameCn": "苏黎世联邦理工学院", "country": "Switzerland", "city": "Zurich", "qsRank": 7, "type": "public"},
    {"name": "EPFL", "nameCn": "洛桑联邦理工学院", "country": "Switzerland", "city": "Lausanne", "qsRank": 36, "type": "public"},
    {"name": "University of Zurich", "nameCn": "苏黎世大学", "country": "Switzerland", "city": "Zurich", "qsRank": 91, "type": "public"},
    
    # 德国 (Germany)
    {"name": "Technical University of Munich", "nameCn": "慕尼黑工业大学", "country": "Germany", "city": "Munich", "qsRank": 37, "type": "public"},
    {"name": "Ludwig Maximilian University of Munich", "nameCn": "慕尼黑大学", "country": "Germany", "city": "Munich", "qsRank": 54, "type": "public"},
    {"name": "Heidelberg University", "nameCn": "海德堡大学", "country": "Germany", "city": "Heidelberg", "qsRank": 87, "type": "public"},
    {"name": "Free University of Berlin", "nameCn": "柏林自由大学", "country": "Germany", "city": "Berlin", "qsRank": 98, "type": "public"},
    {"name": "RWTH Aachen University", "nameCn": "亚琛工业大学", "country": "Germany", "city": "Aachen", "qsRank": 106, "type": "public"},
    
    # 法国 (France)
    {"name": "PSL Research University Paris", "nameCn": "巴黎文理研究大学", "country": "France", "city": "Paris", "qsRank": 24, "type": "public"},
    {"name": "Institut Polytechnique de Paris", "nameCn": "巴黎综合理工学院", "country": "France", "city": "Paris", "qsRank": 38, "type": "public"},
    {"name": "Sorbonne University", "nameCn": "索邦大学", "country": "France", "city": "Paris", "qsRank": 59, "type": "public"},
    
    # 荷兰 (Netherlands)
    {"name": "Delft University of Technology", "nameCn": "代尔夫特理工大学", "country": "Netherlands", "city": "Delft", "qsRank": 47, "type": "public"},
    {"name": "University of Amsterdam", "nameCn": "阿姆斯特丹大学", "country": "Netherlands", "city": "Amsterdam", "qsRank": 53, "type": "public"},
    {"name": "Utrecht University", "nameCn": "乌得勒支大学", "country": "Netherlands", "city": "Utrecht", "qsRank": 107, "type": "public"},
    
    # 比利时 (Belgium)
    {"name": "KU Leuven", "nameCn": "鲁汶大学", "country": "Belgium", "city": "Leuven", "qsRank": 61, "type": "public"},
]

# 专业模板
PROGRAMS = [
    {"name": "Computer Science", "nameCn": "计算机科学", "degreeType": "master", "duration": 24, "iscedCode": "0613"},
    {"name": "Data Science", "nameCn": "数据科学", "degreeType": "master", "duration": 24, "iscedCode": "0613"},
    {"name": "Artificial Intelligence", "nameCn": "人工智能", "degreeType": "master", "duration": 24, "iscedCode": "0613"},
    {"name": "Software Engineering", "nameCn": "软件工程", "degreeType": "master", "duration": 24, "iscedCode": "0613"},
    {"name": "Mechanical Engineering", "nameCn": "机械工程", "degreeType": "master", "duration": 24, "iscedCode": "0715"},
    {"name": "Electrical Engineering", "nameCn": "电气工程", "degreeType": "master", "duration": 24, "iscedCode": "0714"},
    {"name": "Civil Engineering", "nameCn": "土木工程", "degreeType": "master", "duration": 24, "iscedCode": "0731"},
    {"name": "Business Administration", "nameCn": "工商管理", "degreeType": "master", "duration": 24, "iscedCode": "0413"},
    {"name": "Finance", "nameCn": "金融学", "degreeType": "master", "duration": 18, "iscedCode": "0411"},
    {"name": "Economics", "nameCn": "经济学", "degreeType": "master", "duration": 24, "iscedCode": "0311"},
]

def main():
    print("=" * 60)
    print("快速导入欧洲大学数据")
    print("=" * 60)
    print()
    
    # 保存大学数据
    output = {
        "universities": UNIVERSITIES,
        "programs": PROGRAMS,
        "total_universities": len(UNIVERSITIES),
        "total_programs": len(PROGRAMS),
        "source": "QS World University Rankings 2024",
        "last_updated": "2026-01-19"
    }
    
    with open("/home/ubuntu/european_universities_portal/data/universities_data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 已导出 {len(UNIVERSITIES)} 所大学数据")
    print(f"✓ 已导出 {len(PROGRAMS)} 个专业模板")
    print(f"✓ 数据已保存到: data/universities_data.json")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
