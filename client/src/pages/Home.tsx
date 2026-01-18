import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  broadFieldId?: number;
  narrowFieldId?: number;
  detailedFieldId?: number;
  countryId?: number;
  cityId?: number;
  degreeType?: string;
  universityType?: string;
  searchText?: string;
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({});
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

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
    setSearchInput("");
    setPage(0);
  };

  const degreeTypes = ["bachelor", "master", "phd", "foundation", "diploma"];
  const universityTypes = ["public", "private"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            欧洲院校专业信息平台
          </h1>
          <p className="text-lg text-slate-600">
            European Universities Professional Database
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              筛选条件 | Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* ISCED-F Level 1 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  宽泛领域 | Broad Field
                </label>
                <Select
                  value={filters.broadFieldId?.toString() || ""}
                  onValueChange={handleBroadFieldChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择宽泛领域" />
                  </SelectTrigger>
                  <SelectContent>
                    {broadFields?.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.code} - {field.nameCn} ({field.nameEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ISCED-F Level 2 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  狭义领域 | Narrow Field
                </label>
                <Select
                  value={filters.narrowFieldId?.toString() || ""}
                  onValueChange={handleNarrowFieldChange}
                  disabled={!filters.broadFieldId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择狭义领域" />
                  </SelectTrigger>
                  <SelectContent>
                    {narrowFields?.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.code} - {field.nameCn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ISCED-F Level 3 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  详细领域 | Detailed Field
                </label>
                <Select
                  value={filters.detailedFieldId?.toString() || ""}
                  onValueChange={handleDetailedFieldChange}
                  disabled={!filters.narrowFieldId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择详细领域" />
                  </SelectTrigger>
                  <SelectContent>
                    {detailedFields?.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.code} - {field.nameCn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  国家 | Country
                </label>
                <Select
                  value={filters.countryId?.toString() || ""}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择国家" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.nameCn} ({country.nameEn})
                        {!country.isEU && " 🌍"}
                        {country.isSchengen && " 🔵"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  城市 | City
                </label>
                <Select
                  value={filters.cityId?.toString() || ""}
                  onValueChange={handleCityChange}
                  disabled={!filters.countryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.nameCn} ({city.nameEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Degree Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  学位类型 | Degree Type
                </label>
                <Select
                  value={filters.degreeType || ""}
                  onValueChange={handleDegreeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择学位类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "bachelor" && "学士学位 | Bachelor"}
                        {type === "master" && "硕士学位 | Master"}
                        {type === "phd" && "博士学位 | PhD"}
                        {type === "foundation" && "预科课程 | Foundation"}
                        {type === "diploma" && "文凭课程 | Diploma"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* University Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  大学类型 | University Type
                </label>
                <Select
                  value={filters.universityType || ""}
                  onValueChange={handleUniversityTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择大学类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {universityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "public" && "公立大学 | Public"}
                        {type === "private" && "私立大学 | Private"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex-1"
              >
                清除筛选 | Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Programs List */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              专业列表 | Programs
            </h2>
            {programsLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          </div>

          {programsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="space-y-4">
              {programs.map((program: any) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {program.nameEn}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {program.nameCn}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {program.degreeType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">学制 | Duration</p>
                        <p className="font-semibold">{program.durationMonths} 个月</p>
                      </div>
                      <div>
                        <p className="text-slate-600">大学类型 | Type</p>
                        <p className="font-semibold">
                          {program.universityType === "public"
                            ? "公立"
                            : "私立"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">授课语言 | Language</p>
                        <p className="font-semibold">
                          {program.teachingLanguage
                            ? JSON.parse(program.teachingLanguage).join(", ")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">详情 | Details</p>
                        <Button size="sm" variant="outline">
                          查看详情 →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-slate-600">
                  未找到匹配的专业 | No programs found
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
