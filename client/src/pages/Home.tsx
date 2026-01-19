import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, Search, ArrowUpDown, Loader2 } from "lucide-react";

interface FilterState {
  broadFieldId?: number;
  narrowFieldId?: number;
  detailedFieldId?: number;
  countryId?: number;
  cityId?: number;
  degreeType?: string;
  universityType?: string;
  searchQuery?: string;
  sortBy?: 'qsRanking' | 'timesRanking' | 'arwuRanking' | 'tuition';
  sortOrder?: 'asc' | 'desc';
}

export default function Home() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;

  // 获取ISCED-F分类数据
  const { data: broadFields = [] } = trpc.isced.broadFields.useQuery();
  const { data: narrowFields = [] } = trpc.isced.narrowFields.useQuery(
    { broadFieldId: filters.broadFieldId || 0 },
    { enabled: !!filters.broadFieldId }
  );
  const { data: detailedFields = [] } = trpc.isced.detailedFields.useQuery(
    { narrowFieldId: filters.narrowFieldId || 0 },
    { enabled: !!filters.narrowFieldId }
  );

  // 获取国家和城市数据
  const { data: countries = [] } = trpc.countries.list.useQuery();
  const { data: cities = [] } = trpc.cities.byCountry.useQuery(
    { countryId: filters.countryId || 0 },
    { enabled: !!filters.countryId }
  );

  // 获取专业数据
  const { data: programsData = { programs: [], total: 0 }, isLoading } = trpc.programs.list.useQuery(
    {
      limit: pageSize,
      offset: page * pageSize,
      iscedDetailedFieldIds: filters.detailedFieldId ? [filters.detailedFieldId] : [],
      cityIds: filters.cityId ? [filters.cityId] : [],
      degreeTypes: filters.degreeType ? [filters.degreeType] : [],
      universityTypes: filters.universityType ? [filters.universityType] : [],
    },
    { refetchOnWindowFocus: false }
  );

  // 处理数据格式
  const programs = Array.isArray(programsData) ? programsData : (programsData?.programs || []);
  const total = typeof programsData === 'object' && programsData && 'total' in programsData ? programsData.total : programs.length;

  const degreeTypes = [
    { value: "bachelor", label: "学士 | Bachelor" },
    { value: "master", label: "硕士 | Master" },
    { value: "phd", label: "博士 | PhD" }
  ];
  
  const universityTypes = [
    { value: "public", label: "公立 | Public" },
    { value: "private", label: "私立 | Private" }
  ];

  const sortOptions = [
    { value: 'qsRanking', label: 'QS排名 | QS Ranking' },
    { value: 'timesRanking', label: 'Times排名 | Times Ranking' },
    { value: 'arwuRanking', label: 'ARWU排名 | ARWU Ranking' },
    { value: 'tuition', label: '学费 | Tuition' }
  ];

  const handleClearFilters = () => {
    setFilters({});
    setSearchInput("");
    setPage(0);
  };

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setFilters({ ...filters, searchQuery: query });
    setPage(0);
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ ...filters, sortBy: sortBy as any, sortOrder: newSortOrder });
    setPage(0);
  };

  const handleViewDetails = (programId: number) => {
    navigate(`/program/${programId}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">欧洲院校专业信息平台</h1>
            <p className="text-gray-600 mt-2">European Universities Professional Database</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/logs')}>
            查看日志 | View Logs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索专业、学校、城市... | Search programs, universities, cities..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              清除所有 | Clear All
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">筛选条件 | Filters</h2>
            <span className="text-sm text-gray-600">
              共 {total} 条结果 | {total} Results
            </span>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Broad Field Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {filters.broadFieldId
                      ? broadFields.find((f: any) => f.id === filters.broadFieldId)?.nameCn
                      : "宽泛领域"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, broadFieldId: undefined, narrowFieldId: undefined, detailedFieldId: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {broadFields.map((field: any) => (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => {
                      setFilters({ ...filters, broadFieldId: field.id, narrowFieldId: undefined, detailedFieldId: undefined });
                      setPage(0);
                    }}
                  >
                    {field.nameCn}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Narrow Field Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between" disabled={!filters.broadFieldId}>
                  <span>
                    {filters.narrowFieldId
                      ? narrowFields.find((f: any) => f.id === filters.narrowFieldId)?.nameCn
                      : "狭义领域"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, narrowFieldId: undefined, detailedFieldId: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {narrowFields.map((field: any) => (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => {
                      setFilters({ ...filters, narrowFieldId: field.id, detailedFieldId: undefined });
                      setPage(0);
                    }}
                  >
                    {field.nameCn}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Detailed Field Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between" disabled={!filters.narrowFieldId}>
                  <span>
                    {filters.detailedFieldId
                      ? detailedFields.find((f: any) => f.id === filters.detailedFieldId)?.nameCn
                      : "详细领域"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, detailedFieldId: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {detailedFields.map((field: any) => (
                  <DropdownMenuItem
                    key={field.id}
                    onClick={() => {
                      setFilters({ ...filters, detailedFieldId: field.id });
                      setPage(0);
                    }}
                  >
                    {field.nameCn}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Country Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {filters.countryId
                      ? countries.find((c: any) => c.id === filters.countryId)?.nameCn
                      : "国家"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, countryId: undefined, cityId: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {countries.map((country: any) => (
                  <DropdownMenuItem
                    key={country.id}
                    onClick={() => {
                      setFilters({ ...filters, countryId: country.id, cityId: undefined });
                      setPage(0);
                    }}
                  >
                    {country.nameCn} {country.isEU ? "🇪🇺" : ""} {country.isSchengen ? "🔵" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* City Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between" disabled={!filters.countryId}>
                  <span>
                    {filters.cityId
                      ? cities.find((c: any) => c.id === filters.cityId)?.nameCn
                      : "城市"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, cityId: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {cities.map((city: any) => (
                  <DropdownMenuItem
                    key={city.id}
                    onClick={() => {
                      setFilters({ ...filters, cityId: city.id });
                      setPage(0);
                    }}
                  >
                    {city.nameCn}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Degree Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {filters.degreeType
                      ? degreeTypes.find((d) => d.value === filters.degreeType)?.label
                      : "学位"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, degreeType: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {degreeTypes.map((degree) => (
                  <DropdownMenuItem
                    key={degree.value}
                    onClick={() => {
                      setFilters({ ...filters, degreeType: degree.value });
                      setPage(0);
                    }}
                  >
                    {degree.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* University Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {filters.universityType
                      ? universityTypes.find((u) => u.value === filters.universityType)?.label
                      : "大学类型"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, universityType: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {universityTypes.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => {
                      setFilters({ ...filters, universityType: type.value });
                      setPage(0);
                    }}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {filters.sortBy
                      ? sortOptions.find((s) => s.value === filters.sortBy)?.label
                      : "排序"}
                  </span>
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, sortBy: undefined, sortOrder: undefined });
                    setPage(0);
                  }}
                >
                  默认排序 | Default
                </DropdownMenuItem>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                  >
                    {option.label}
                    {filters.sortBy === option.value && (
                      <span className="ml-2">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              加载中... | Loading...
            </div>
          ) : programs.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              未找到匹配的专业 | No matching programs found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">专业名 | Program</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">学校 | University</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">国家 | Country</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">城市 | City</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">学位 | Degree</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">学费 | Tuition</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">操作 | Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {programs.map((program: any) => (
                      <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{program.nameCn || program.nameEn}</div>
                          <div className="text-gray-600 text-xs">{program.nameEn}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{program.universityName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{program.countryName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{program.cityName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{program.degreeType || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{program.tuition || '未知'}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(program.id)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            查看详情
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  第 {page + 1} / {totalPages || 1} 页 | Page {page + 1} of {totalPages || 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    上一页 | Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min((totalPages || 1) - 1, page + 1))}
                    disabled={page === (totalPages || 1) - 1}
                  >
                    下一页 | Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
