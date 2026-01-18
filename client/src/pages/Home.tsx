import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye } from "lucide-react";

interface FilterState {
  broadFieldId?: number;
  narrowFieldId?: number;
  detailedFieldId?: number;
  countryId?: number;
  cityId?: number;
  degreeType?: string;
  universityType?: string;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // 获取ISCED-F分类数据
  const { data: broadFields = [] } = trpc.isced.broadFields.useQuery();
  const { data: narrowFields = [] } = trpc.isced.narrowFields.useQuery(
    filters.broadFieldId ? { broadFieldId: filters.broadFieldId } : { broadFieldId: 0 },
    { enabled: !!filters.broadFieldId }
  );
  const { data: detailedFields = [] } = trpc.isced.detailedFields.useQuery(
    filters.narrowFieldId ? { narrowFieldId: filters.narrowFieldId } : { narrowFieldId: 0 },
    { enabled: !!filters.narrowFieldId }
  );

  // 获取国家和城市数据
  const { data: countries = [] } = trpc.countries.list.useQuery();
  const { data: cities = [] } = trpc.cities.byCountry.useQuery(
    filters.countryId ? { countryId: filters.countryId } : { countryId: 0 },
    { enabled: !!filters.countryId }
  );

  // 获取专业数据
  const { data: programs = [], isLoading } = trpc.programs.list.useQuery(
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

  const degreeTypes = ["bachelor", "master", "phd"];
  const universityTypes = ["public", "private"];

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleViewDetails = (programId: number) => {
    navigate(`/program/${programId}`);
  };

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
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">筛选条件 | Filters</h2>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              清除所有筛选 | Clear All
            </Button>
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
                      : "宽泛领域 | Broad Field"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                    {field.nameCn} ({field.code})
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
                      : "狭义领域 | Narrow Field"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                    {field.nameCn} ({field.code})
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
                      : "详细领域 | Detailed Field"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                    {field.nameCn} ({field.code})
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
                      : "国家 | Country"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                      : "城市 | City"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
                      ? {
                          bachelor: "学士 | Bachelor",
                          master: "硕士 | Master",
                          phd: "博士 | PhD",
                        }[filters.degreeType]
                      : "学位 | Degree"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setFilters({ ...filters, degreeType: undefined });
                    setPage(0);
                  }}
                >
                  全部 | All
                </DropdownMenuItem>
                {degreeTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => {
                      setFilters({ ...filters, degreeType: type });
                      setPage(0);
                    }}
                  >
                    {type === "bachelor" && "学士 | Bachelor"}
                    {type === "master" && "硕士 | Master"}
                    {type === "phd" && "博士 | PhD"}
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
                      ? filters.universityType === "public"
                        ? "公立 | Public"
                        : "私立 | Private"
                      : "大学类型 | Type"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
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
                    key={type}
                    onClick={() => {
                      setFilters({ ...filters, universityType: type });
                      setPage(0);
                    }}
                  >
                    {type === "public" ? "公立 | Public" : "私立 | Private"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              专业列表 | Programs ({programs.length} 结果 | Results)
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中... | Loading...</div>
          ) : programs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              未找到匹配的专业 | No programs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      专业名称 | Program Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      学校 | University
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      国家 | Country
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      城市 | City
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      学位 | Degree
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      学费 | Tuition
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      操作 | Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {programs.map((program: any) => (
                    <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {program.nameCn}
                        <br />
                        <span className="text-gray-600">{program.nameEn}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.universityName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.countryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.cityName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.degreeType === "bachelor" && "学士 | Bachelor"}
                        {program.degreeType === "master" && "硕士 | Master"}
                        {program.degreeType === "phd" && "博士 | PhD"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {program.tuition || "详见详情"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleViewDetails(program.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          查看详情 | View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {programs.length > 0 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                上一页 | Previous
              </Button>
              <span className="text-sm text-gray-600">
                第 {page + 1} 页 | Page {page + 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={programs.length < pageSize}
              >
                下一页 | Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
