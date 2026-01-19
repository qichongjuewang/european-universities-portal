# 欧洲院校专业信息平台 - API文档

## 概述

本文档详细说明了欧洲院校专业信息平台的所有后端API接口。所有API都通过tRPC实现，支持完整的类型安全和自动验证。

## 基础信息

- **API基础路径**: `/api/trpc`
- **认证**: 支持Manus OAuth认证
- **数据格式**: JSON
- **序列化**: SuperJSON（支持Date、Map等复杂类型）

## API分类

### 1. ISCED-F分类API

ISCED-F是联合国教科文组织的教育分类标准，分为三个层级：宽泛领域 → 狭义领域 → 详细领域。

#### 1.1 获取宽泛领域列表
```
trpc.isced.broadFields.useQuery()
```

**返回数据**:
```typescript
{
  id: number;
  code: string;
  nameCn: string;
  nameEn: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: broadFields } = trpc.isced.broadFields.useQuery();
// 返回所有宽泛领域（如：教育、工程、医学等）
```

#### 1.2 获取狭义领域列表
```
trpc.isced.narrowFields.useQuery({ broadFieldId: number })
```

**输入参数**:
- `broadFieldId`: 宽泛领域ID

**返回数据**:
```typescript
{
  id: number;
  broadFieldId: number;
  code: string;
  nameCn: string;
  nameEn: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: narrowFields } = trpc.isced.narrowFields.useQuery({
  broadFieldId: 1
});
// 返回宽泛领域1下的所有狭义领域
```

#### 1.3 获取详细领域列表
```
trpc.isced.detailedFields.useQuery({ narrowFieldId: number })
```

**输入参数**:
- `narrowFieldId`: 狭义领域ID

**返回数据**:
```typescript
{
  id: number;
  narrowFieldId: number;
  code: string;
  nameCn: string;
  nameEn: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: detailedFields } = trpc.isced.detailedFields.useQuery({
  narrowFieldId: 1
});
// 返回狭义领域1下的所有详细领域
```

---

### 2. 国家API

#### 2.1 获取国家列表
```
trpc.countries.list.useQuery()
```

**返回数据**:
```typescript
{
  id: number;
  code: string;
  nameCn: string;
  nameEn: string;
  isEU: boolean;
  isSchengen: boolean;
  visaInfo?: string; // JSON字符串
  residencyInfo?: string; // JSON字符串
  greenCardInfo?: string; // JSON字符串
  costOfLiving?: string; // JSON字符串
  touristInfo?: string; // JSON字符串
  officialLinks?: string; // JSON字符串
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: countries } = trpc.countries.list.useQuery();
// 返回所有欧洲国家列表
```

#### 2.2 获取单个国家详情
```
trpc.countries.byId.useQuery({ id: number })
```

**输入参数**:
- `id`: 国家ID

**返回数据**: 同上

**示例**:
```javascript
const { data: country } = trpc.countries.byId.useQuery({ id: 1 });
// 返回ID为1的国家详细信息
```

---

### 3. 城市API

#### 3.1 获取指定国家的城市列表
```
trpc.cities.byCountry.useQuery({ countryId: number })
```

**输入参数**:
- `countryId`: 国家ID

**返回数据**:
```typescript
{
  id: number;
  countryId: number;
  nameCn: string;
  nameEn: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: cities } = trpc.cities.byCountry.useQuery({
  countryId: 1
});
// 返回国家1的所有城市
```

---

### 4. 大学API

#### 4.1 获取指定国家的大学列表
```
trpc.universities.byCountry.useQuery({ countryId: number })
```

**输入参数**:
- `countryId`: 国家ID

**返回数据**:
```typescript
{
  id: number;
  countryId: number;
  nameCn: string;
  nameEn: string;
  type: 'public' | 'private';
  foundedYear?: number;
  description?: string;
  qsRanking?: number;
  timesRanking?: number;
  arwuRanking?: number;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**示例**:
```javascript
const { data: universities } = trpc.universities.byCountry.useQuery({
  countryId: 1
});
// 返回国家1的所有大学
```

#### 4.2 获取单个大学详情（含关联数据）
```
trpc.universities.byId.useQuery({ id: number })
```

**输入参数**:
- `id`: 大学ID

**返回数据**:
```typescript
{
  // 基本信息
  id: number;
  countryId: number;
  nameCn: string;
  nameEn: string;
  type: 'public' | 'private';
  foundedYear?: number;
  description?: string;
  qsRanking?: number;
  timesRanking?: number;
  arwuRanking?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  accommodations: {
    id: number;
    universityId: number;
    accommodationType: string;
    monthlyFeeMin: string;
    monthlyFeeMax: string;
    currencyCode: string;
    rmbExchangeRate: string;
    rmbMonthlyMin: string;
    rmbMonthlyMax: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  scholarships: {
    id: number;
    universityId: number;
    nameCn: string;
    nameEn: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  opportunities: {
    id: number;
    universityId: number;
    nameCn: string;
    nameEn: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
```

**示例**:
```javascript
const { data: university } = trpc.universities.byId.useQuery({ id: 1 });
// 返回大学1的详细信息，包括住宿、奖学金、学生机会等
```

---

### 5. 程序API

#### 5.1 获取程序列表（支持筛选和分页）
```
trpc.programs.list.useQuery({
  universityIds?: number[];
  cityIds?: number[];
  iscedDetailedFieldIds?: number[];
  degreeTypes?: string[];
  universityTypes?: string[];
  limit?: number;
  offset?: number;
})
```

**输入参数**:
- `universityIds`: 大学ID数组（可选）
- `cityIds`: 城市ID数组（可选）
- `iscedDetailedFieldIds`: ISCED详细领域ID数组（可选）
- `degreeTypes`: 学位类型数组，可选值：`['bachelor', 'master', 'phd']`（可选）
- `universityTypes`: 大学类型数组，可选值：`['public', 'private']`（可选）
- `limit`: 每页数量，默认20（可选）
- `offset`: 分页偏移，默认0（可选）

**返回数据**:
```typescript
{
  programs: {
    id: number;
    nameCn: string;
    nameEn: string;
    degreeType: 'bachelor' | 'master' | 'phd';
    universityType: 'public' | 'private';
    durationMonths: number;
    teachingLanguage: string; // JSON字符串
    universityId: number;
    cityId: number;
    iscedDetailedFieldId: number;
    universityName: string; // JOIN自universities表
    cityName: string; // JOIN自cities表
    countryName: string; // JOIN自countries表
    tuition?: string; // 学费（原币种）
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number; // 总记录数
}
```

**示例**:
```javascript
// 获取所有硕士程序，每页20条
const { data: programsData } = trpc.programs.list.useQuery({
  degreeTypes: ['master'],
  limit: 20,
  offset: 0,
});

// 获取指定国家的所有程序
const { data: programsData } = trpc.programs.list.useQuery({
  cityIds: [1, 2, 3], // 城市1、2、3的程序
  limit: 20,
  offset: 0,
});
```

#### 5.2 获取单个程序详情
```
trpc.programs.byId.useQuery({ id: number })
```

**输入参数**:
- `id`: 程序ID

**返回数据**: 同programs.list返回的单个program对象

**示例**:
```javascript
const { data: program } = trpc.programs.byId.useQuery({ id: 1 });
// 返回ID为1的程序基本信息
```

#### 5.3 获取程序完整详情（含所有关联数据）
```
trpc.programs.detail.useQuery({ id: number })
```

**输入参数**:
- `id`: 程序ID

**返回数据**:
```typescript
{
  // 基本程序信息
  id: number;
  nameCn: string;
  nameEn: string;
  degreeType: 'bachelor' | 'master' | 'phd';
  universityType: 'public' | 'private';
  durationMonths: number;
  teachingLanguage: string; // JSON字符串
  universityId: number;
  cityId: number;
  iscedDetailedFieldId: number;
  description?: string;
  officialUrl?: string;
  admissionRequirements?: string; // JSON字符串
  createdAt: Date;
  updatedAt: Date;
  
  // 关联数据
  tuition: {
    id: number;
    programId: number;
    currencyCode: string;
    annualFeeAmount: string;
    semesterFeeAmount?: string;
    isFree: boolean;
    rmbExchangeRate: string;
    rmbAnnualAmount: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  
  scholarships: {
    id: number;
    programId: number;
    nameCn: string;
    nameEn: string;
    amount?: string;
    currencyCode?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  
  courses: {
    id: number;
    programId: number;
    nameCn: string;
    nameEn: string;
    credits?: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  
  employment: {
    id: number;
    programId: number;
    employmentRate?: string;
    averageSalary?: string;
    topEmployers?: string;
    careerPaths?: string;
    alumniInfo?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  
  opportunities: {
    id: number;
    programId: number;
    nameCn: string;
    nameEn: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
```

**示例**:
```javascript
const { data: detail } = trpc.programs.detail.useQuery({ id: 1 });
// 返回程序1的完整详情，包括学费、奖学金、课程、就业等所有信息
```

#### 5.4 搜索程序
```
trpc.programs.search.useQuery({ query: string, limit?: number })
```

**输入参数**:
- `query`: 搜索关键词（必需）
- `limit`: 返回结果数量，默认20（可选）

**返回数据**: 程序数组（同programs.list中的programs）

**示例**:
```javascript
const { data: results } = trpc.programs.search.useQuery({
  query: '计算机',
  limit: 10,
});
// 返回包含"计算机"的程序列表
```

---

### 6. 认证API

#### 6.1 获取当前用户信息
```
trpc.auth.me.useQuery()
```

**返回数据**:
```typescript
{
  id: number;
  openId: string;
  email: string;
  name: string;
  loginMethod: 'manus' | 'oauth';
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null
```

**示例**:
```javascript
const { data: user } = trpc.auth.me.useQuery();
// 如果用户已认证，返回用户信息；否则返回null
```

#### 6.2 用户登出
```
trpc.auth.logout.useMutation()
```

**返回数据**:
```typescript
{ success: true }
```

**示例**:
```javascript
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
// 清除session cookie并登出用户
```

---

### 7. 日志API

#### 7.1 获取日志列表
```
trpc.logs.getLogs.useQuery({ level?: string, module?: string, limit?: number })
```

**输入参数**:
- `level`: 日志级别（可选），可选值：`'DEBUG', 'INFO', 'WARN', 'ERROR'`
- `module`: 模块名称（可选）
- `limit`: 返回数量（可选）

**返回数据**: 日志数组

**示例**:
```javascript
const { data: logs } = trpc.logs.getLogs.useQuery({
  level: 'ERROR',
  limit: 50,
});
// 返回最近50条ERROR级别的日志
```

#### 7.2 获取日志统计
```
trpc.logs.getStats.useQuery()
```

**返回数据**: 日志统计信息

**示例**:
```javascript
const { data: stats } = trpc.logs.getStats.useQuery();
// 返回日志统计信息
```

#### 7.3 清除所有日志
```
trpc.logs.clearLogs.useMutation()
```

**返回数据**:
```typescript
{ success: true }
```

**示例**:
```javascript
const clearLogs = trpc.logs.clearLogs.useMutation();
await clearLogs.mutateAsync();
// 清除所有日志
```

---

## 前端使用示例

### 完整的程序列表页面示例

```javascript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ProgramsPage() {
  const [filters, setFilters] = useState({
    degreeTypes: [],
    universityTypes: [],
    cityIds: [],
  });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // 获取筛选选项
  const { data: countries = [] } = trpc.countries.list.useQuery();
  const { data: cities = [] } = trpc.cities.byCountry.useQuery(
    { countryId: filters.countryId || 0 },
    { enabled: !!filters.countryId }
  );

  // 获取程序列表
  const { data: programsData = { programs: [], total: 0 }, isLoading } = 
    trpc.programs.list.useQuery({
      limit: pageSize,
      offset: page * pageSize,
      degreeTypes: filters.degreeTypes,
      universityTypes: filters.universityTypes,
      cityIds: filters.cityIds,
    });

  const programs = programsData.programs;
  const total = programsData.total;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* 筛选器 */}
      <div className="filters">
        <select 
          onChange={(e) => setFilters({...filters, degreeTypes: [e.target.value]})}
        >
          <option value="">所有学位</option>
          <option value="bachelor">学士</option>
          <option value="master">硕士</option>
          <option value="phd">博士</option>
        </select>
      </div>

      {/* 程序列表 */}
      {isLoading ? (
        <p>加载中...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>程序名称</th>
                <th>学校</th>
                <th>国家</th>
                <th>学位</th>
                <th>学费</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id}>
                  <td>{program.nameCn}</td>
                  <td>{program.universityName}</td>
                  <td>{program.countryName}</td>
                  <td>{program.degreeType}</td>
                  <td>{program.tuition}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div className="pagination">
            <button onClick={() => setPage(Math.max(0, page - 1))}>
              上一页
            </button>
            <span>第 {page + 1} / {totalPages} 页</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 错误处理

所有API调用都可能返回错误。使用tRPC时，错误会通过`error`属性返回：

```javascript
const { data, isLoading, error } = trpc.programs.list.useQuery({...});

if (error) {
  console.error('API错误:', error.message);
  // 处理错误
}
```

常见错误类型：
- `UNAUTHORIZED`: 用户未认证
- `FORBIDDEN`: 用户无权限
- `NOT_FOUND`: 资源不存在
- `BAD_REQUEST`: 请求参数无效
- `INTERNAL_SERVER_ERROR`: 服务器错误

---

## 数据类型参考

### 学位类型
- `bachelor`: 学士学位
- `master`: 硕士学位
- `phd`: 博士学位

### 大学类型
- `public`: 公立大学
- `private`: 私立大学

### 日志级别
- `DEBUG`: 调试信息
- `INFO`: 一般信息
- `WARN`: 警告信息
- `ERROR`: 错误信息

---

## 性能优化建议

1. **使用分页**: 始终使用`limit`和`offset`参数进行分页，避免一次加载过多数据
2. **条件查询**: 使用`enabled`选项条件性地启用查询
3. **缓存**: tRPC自动缓存查询结果，避免重复请求
4. **搜索优化**: 搜索功能支持模糊匹配，建议在用户停止输入后再发起搜索

---

## 最后更新

- 版本: 1.0.0
- 更新时间: 2026-01-19
- 总API数: 24个测试通过
