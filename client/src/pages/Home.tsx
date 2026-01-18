import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Fetch ISCED-F data
  const { data: broadFields } = trpc.isced.broadFields.useQuery();
  const { data: narrowFields } = trpc.isced.narrowFields.useQuery(
    { broadFieldId: filters.broadFieldId || 0 },
    { enabled: !!filters.broadFieldId }
  );
  const { data: detailedFields } = trpc.isced.detailedFields.useQuery(
    { narrowFieldId: filters.narrowFieldId || 0 },
    { enabled: !!filters.narrowFieldId }
  );

  // Fetch countries and cities
  const { data: countries } = trpc.countries.list.useQuery();
  const { data: cities } = trpc.cities.byCountry.useQuery(
    { countryId: filters.countryId || 0 },
    { enabled: !!filters.countryId }
  );

  // Fetch programs with current filters
  const programFilters = useMemo(() => {
    const filterIds: any = {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    };

    if (filters.detailedFieldId) {
      filterIds.iscedDetailedFieldIds = [filters.detailedFieldId];
    }
    if (filters.cityId) {
      filterIds.cityIds = [filters.cityId];
    }
    if (filters.degreeType) {
      filterIds.degreeTypes = [filters.degreeType];
    }
    if (filters.universityType) {
      filterIds.universityTypes = [filters.universityType];
    }

    return filterIds;
  }, [filters, page]);

  const { data: programs, isLoading: programsLoading } =
    trpc.programs.search.useQuery(programFilters);

  // Handle filter changes
  const handleBroadFieldChange = (value: string) => {
    const id = parseInt(value);
    setFilters({
      ...filters,
      broadFieldId: id,
      narrowFieldId: undefined,
      detailedFieldId: undefined,
    });
    setPage(0);
  };

  const handleNarrowFieldChange = (value: string) => {
    const id = parseInt(value);
    setFilters({
      ...filters,
      narrowFieldId: id,
      detailedFieldId: undefined,
    });
    setPage(0);
  };

  const handleDetailedFieldChange = (value: string) => {
    const id = parseInt(value);
    setFilters({ ...filters, detailedFieldId: id });
    setPage(0);
  };

  const handleCountryChange = (value: string) => {
    const id = parseInt(value);
    setFilters({ ...filters, countryId: id, cityId: undefined });
    setPage(0);
  };

  const handleCityChange = (value: string) => {
    const id = parseInt(value);
    setFilters({ ...filters, cityId: id });
    setPage(0);
  };

  const handleDegreeChange = (value: string) => {
    setFilters({ ...filters, degreeType: value });
    setPage(0);
  };

  const handleUniversityTypeChange = (value: string) => {
    setFilters({ ...filters, universityType: value });
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const degreeTypes = ["bachelor", "master", "phd", "foundation", "diploma"];
  const universityTypes = ["public", "private"];

  // Get display names for current filters
  const getBroadFieldName = () => {
    if (!filters.broadFieldId) return "所有领域";
    return broadFields?.find((f) => f.id === filters.broadFieldId)?.nameCn || "选择";
  };

  const getNarrowFieldName = () => {
    if (!filters.narrowFieldId) return "所有领域";
    return narrowFields?.find((f) => f.id === filters.narrowFieldId)?.nameCn || "选择";
  };

  const getDetailedFieldName = () => {
    if (!filters.detailedFieldId) return "所有领域";
    return detailedFields?.find((f) => f.id === filters.detailedFieldId)?.nameCn || "选择";
  };

  const getCountryName = () => {
    if (!filters.countryId) return "所有国家";
    const country = countries?.find((c) => c.id === filters.countryId);
    return country ? `${country.nameCn}` : "选择";
  };

  const getCityName = () => {
    if (!filters.cityId) return "所有城市";
    return cities?.find((c) => c.id === filters.cityId)?.nameCn || "选择";
  };

  const getDegreeName = () => {
    if (!filters.degreeType) return "所有学位";
    const names: any = {
      bachelor: "学士",
      master: "硕士",
      phd: "博士",
      foundation: "预科",
      diploma: "文凭",
    };
    return names[filters.degreeType] || "选择";
  };

  const getUniversityTypeName = () => {
    if (!filters.universityType) return "所有类型";
    return filters.universityType === "public" ? "公立" : "私立";
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            欧洲院校专业信息平台
          </h1>
          <p className="text-base text-slate-600">
            European Universities Professional Database
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Table with Header Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  专业列表 | Programs
                </CardTitle>
                <CardDescription className="mt-2">
                  {programsLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </span>
                  ) : (
                    `共 ${programs?.length || 0} 条结果 ${
                      hasActiveFilters ? "| 已应用筛选" : ""
                    }`
                  )}
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  清除所有筛选
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    {/* Broad Field */}
                    <TableHead className="min-w-[120px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                          >
                            <span className="truncate">
                              宽泛领域 | {getBroadFieldName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>宽泛领域 | Broad Field</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.broadFieldId}
                            onCheckedChange={() =>
                              setFilters({
                                ...filters,
                                broadFieldId: undefined,
                                narrowFieldId: undefined,
                                detailedFieldId: undefined,
                              })
                            }
                          >
                            所有领域
                          </DropdownMenuCheckboxItem>
                          {broadFields?.map((field) => (
                            <DropdownMenuCheckboxItem
                              key={field.id}
                              checked={filters.broadFieldId === field.id}
                              onCheckedChange={() =>
                                handleBroadFieldChange(field.id.toString())
                              }
                            >
                              {field.code} - {field.nameCn}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* Narrow Field */}
                    <TableHead className="min-w-[120px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                            disabled={!filters.broadFieldId}
                          >
                            <span className="truncate">
                              狭义领域 | {getNarrowFieldName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>狭义领域 | Narrow Field</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.narrowFieldId}
                            onCheckedChange={() =>
                              setFilters({
                                ...filters,
                                narrowFieldId: undefined,
                                detailedFieldId: undefined,
                              })
                            }
                          >
                            所有领域
                          </DropdownMenuCheckboxItem>
                          {narrowFields?.map((field) => (
                            <DropdownMenuCheckboxItem
                              key={field.id}
                              checked={filters.narrowFieldId === field.id}
                              onCheckedChange={() =>
                                handleNarrowFieldChange(field.id.toString())
                              }
                            >
                              {field.code} - {field.nameCn}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* Detailed Field */}
                    <TableHead className="min-w-[120px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                            disabled={!filters.narrowFieldId}
                          >
                            <span className="truncate">
                              详细领域 | {getDetailedFieldName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>详细领域 | Detailed Field</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.detailedFieldId}
                            onCheckedChange={() =>
                              setFilters({ ...filters, detailedFieldId: undefined })
                            }
                          >
                            所有领域
                          </DropdownMenuCheckboxItem>
                          {detailedFields?.map((field) => (
                            <DropdownMenuCheckboxItem
                              key={field.id}
                              checked={filters.detailedFieldId === field.id}
                              onCheckedChange={() =>
                                handleDetailedFieldChange(field.id.toString())
                              }
                            >
                              {field.code} - {field.nameCn}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* Country */}
                    <TableHead className="min-w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                          >
                            <span className="truncate">
                              国家 | {getCountryName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>国家 | Country</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.countryId}
                            onCheckedChange={() =>
                              setFilters({
                                ...filters,
                                countryId: undefined,
                                cityId: undefined,
                              })
                            }
                          >
                            所有国家
                          </DropdownMenuCheckboxItem>
                          {countries?.map((country) => (
                            <DropdownMenuCheckboxItem
                              key={country.id}
                              checked={filters.countryId === country.id}
                              onCheckedChange={() =>
                                handleCountryChange(country.id.toString())
                              }
                            >
                              {country.nameCn} {!country.isEU && "🌍"}
                              {country.isSchengen && "🔵"}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* City */}
                    <TableHead className="min-w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                            disabled={!filters.countryId}
                          >
                            <span className="truncate">
                              城市 | {getCityName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>城市 | City</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.cityId}
                            onCheckedChange={() =>
                              setFilters({ ...filters, cityId: undefined })
                            }
                          >
                            所有城市
                          </DropdownMenuCheckboxItem>
                          {cities?.map((city) => (
                            <DropdownMenuCheckboxItem
                              key={city.id}
                              checked={filters.cityId === city.id}
                              onCheckedChange={() =>
                                handleCityChange(city.id.toString())
                              }
                            >
                              {city.nameCn}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* Degree Type */}
                    <TableHead className="min-w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                          >
                            <span className="truncate">
                              学位 | {getDegreeName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>学位类型 | Degree Type</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.degreeType}
                            onCheckedChange={() =>
                              setFilters({ ...filters, degreeType: undefined })
                            }
                          >
                            所有学位
                          </DropdownMenuCheckboxItem>
                          {degreeTypes.map((type) => (
                            <DropdownMenuCheckboxItem
                              key={type}
                              checked={filters.degreeType === type}
                              onCheckedChange={() => handleDegreeChange(type)}
                            >
                              {type === "bachelor" && "学士学位"}
                              {type === "master" && "硕士学位"}
                              {type === "phd" && "博士学位"}
                              {type === "foundation" && "预科课程"}
                              {type === "diploma" && "文凭课程"}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* University Type */}
                    <TableHead className="min-w-[100px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-between"
                          >
                            <span className="truncate">
                              类型 | {getUniversityTypeName()}
                            </span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>大学类型 | University Type</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!filters.universityType}
                            onCheckedChange={() =>
                              setFilters({ ...filters, universityType: undefined })
                            }
                          >
                            所有类型
                          </DropdownMenuCheckboxItem>
                          {universityTypes.map((type) => (
                            <DropdownMenuCheckboxItem
                              key={type}
                              checked={filters.universityType === type}
                              onCheckedChange={() =>
                                handleUniversityTypeChange(type)
                              }
                            >
                              {type === "public" ? "公立大学" : "私立大学"}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>

                    {/* Program Name */}
                    <TableHead className="min-w-[200px]">专业名 | Program Name</TableHead>

                    {/* School Name */}
                    <TableHead className="min-w-[150px]">学校 | School</TableHead>

                    {/* Duration */}
                    <TableHead className="min-w-[80px]">学制 | Duration</TableHead>

                    {/* Language */}
                    <TableHead className="min-w-[100px]">语言 | Language</TableHead>

                    {/* Action */}
                    <TableHead className="min-w-[80px]">操作 | Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {programsLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : programs && programs.length > 0 ? (
                    programs.map((program: any) => (
                      <TableRow key={program.id} className="hover:bg-slate-50">
                        <TableCell className="text-xs text-slate-600">
                          {program.iscedDetailedFieldId}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {program.cityId}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {program.iscedDetailedFieldId}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {program.countryId}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {program.cityId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {program.degreeType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {program.universityType === "public"
                              ? "公立"
                              : "私立"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {program.nameEn}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          学校 {program.universityId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {program.durationMonths}M
                        </TableCell>
                        <TableCell className="text-xs">
                          {program.teachingLanguage
                            ? JSON.parse(program.teachingLanguage).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            详情 →
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <p className="text-slate-600">
                          未找到匹配的专业 | No programs found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
