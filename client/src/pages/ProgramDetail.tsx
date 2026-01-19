import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Globe, BookOpen, DollarSign, ArrowLeft, ExternalLink, Users, Briefcase, Home } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProgramDetail() {
  const [match, params] = useRoute("/program/:id");

  if (!match) return null;

  const programId = parseInt(params?.id || "0");
  const { data: program, isLoading, error } = trpc.programs.detail.useQuery(
    { id: programId },
    { enabled: !!programId }
  );

  const { data: university } = trpc.universities.byId.useQuery(
    { id: program?.universityId || 0 },
    { enabled: !!program?.universityId }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-red-600">加载失败 | Error loading program: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-slate-600">专业未找到 | Program not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse JSON fields
  const teachingLanguages = program.teachingLanguage ? JSON.parse(program.teachingLanguage) : [];
  const admissionRequirements = program.admissionRequirements ? JSON.parse(program.admissionRequirements) : {};

  // Convert tuition to RMB if available
  const tuitionInRmb = program.tuition?.rmbAnnualAmount ? `¥${Number(program.tuition.rmbAnnualAmount).toLocaleString('zh-CN')}` : '未知';
  const tuitionInOriginal = program.tuition?.annualFeeAmount ? `${program.tuition.currencyCode} ${Number(program.tuition.annualFeeAmount).toLocaleString()}` : '未知';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回 | Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{program.nameCn}</h1>
            <p className="text-gray-600 mt-2 text-lg">{program.nameEn}</p>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">{program.degreeType}</Badge>
              <Badge variant="secondary">{program.universityType}</Badge>
              <Badge variant="secondary">{program.durationMonths} 个月 | months</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>基本信息 | Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">学校 | University</p>
                    <p className="font-semibold">{university?.nameCn || '未知'}</p>
                    <p className="text-sm text-gray-600">{university?.nameEn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">学位类型 | Degree Type</p>
                    <p className="font-semibold capitalize">{program.degreeType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">学制 | Duration</p>
                    <p className="font-semibold">{program.durationMonths} 个月 | months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">大学类型 | University Type</p>
                    <p className="font-semibold capitalize">{program.universityType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teaching Languages */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>教学语言 | Teaching Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teachingLanguages.length > 0 ? (
                    teachingLanguages.map((lang: string, idx: number) => (
                      <Badge key={idx} variant="outline">{lang}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-600">未指定 | Not specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admission Requirements */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>入学要求 | Admission Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(admissionRequirements).length > 0 ? (
                  Object.entries(admissionRequirements).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600 capitalize">{key}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">未指定 | Not specified</p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {program.description && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>项目描述 | Program Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{program.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Detailed Tabs */}
            <Tabs defaultValue="courses" className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="courses">课程 | Courses</TabsTrigger>
                <TabsTrigger value="employment">就业 | Employment</TabsTrigger>
                <TabsTrigger value="scholarships">奖学金 | Scholarships</TabsTrigger>
                <TabsTrigger value="opportunities">机会 | Opportunities</TabsTrigger>
              </TabsList>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      课程设置 | Course Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {program.courses && program.courses.length > 0 ? (
                      <div className="space-y-4">
                        {program.courses.map((course: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4">
                            <p className="font-semibold">{course.nameCn || course.nameEn}</p>
                            <p className="text-sm text-gray-600">{course.nameEn}</p>
                            {course.credits && <p className="text-sm text-gray-600">学分 | Credits: {course.credits}</p>}
                            {course.description && <p className="text-sm mt-2">{course.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">暂无课程信息 | No course information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      就业前景 | Employment Prospects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {program.employment ? (
                      <>
                        {program.employment?.employmentRate && (
                          <div>
                            <p className="text-sm text-gray-600">就业率 | Employment Rate</p>
                            <p className="font-semibold">{program.employment.employmentRate}%</p>
                          </div>
                        )}

                        {program.employment.averageSalary && (
                          <div>
                            <p className="text-sm text-gray-600">平均薪资 | Average Salary</p>
                            <p className="font-semibold">{program.employment.averageSalary}</p>
                          </div>
                        )}
                        {program.employment.topEmployers && (
                          <div>
                            <p className="text-sm text-gray-600">主要雇主 | Top Employers</p>
                            <p className="font-semibold">{program.employment.topEmployers}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">暂无就业信息 | No employment information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scholarships Tab */}
              <TabsContent value="scholarships">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      奖学金 | Scholarships
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {program.scholarships && program.scholarships.length > 0 ? (
                      <div className="space-y-4">
                        {program.scholarships.map((scholarship: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <p className="font-semibold">{scholarship.nameCn || scholarship.nameEn}</p>
                            <p className="text-sm text-gray-600">{scholarship.nameEn}</p>
                            {scholarship.amount && (
                              <p className="text-sm mt-2">
                                金额 | Amount: {scholarship.currencyCode} {Number(scholarship.amount).toLocaleString()}
                              </p>
                            )}
                            {scholarship.description && <p className="text-sm mt-2">{scholarship.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">暂无奖学金信息 | No scholarship information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      学生机会 | Student Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {program.opportunities && program.opportunities.length > 0 ? (
                      <div className="space-y-4">
                        {program.opportunities.map((opp: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-green-500 pl-4">
                            <p className="font-semibold">{opp.nameCn || opp.nameEn}</p>
                            <p className="text-sm text-gray-600">{opp.nameEn}</p>
                            {opp.description && <p className="text-sm mt-2">{opp.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">暂无学生机会信息 | No opportunity information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Tuition Card */}
            <Card className="mb-6 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  学费 | Tuition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">原币种 | Original Currency</p>
                  <p className="font-semibold text-lg">{tuitionInOriginal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">人民币 | RMB</p>
                  <p className="font-semibold text-lg text-green-600">{tuitionInRmb}</p>
                </div>
                {program.tuition?.semesterFeeAmount && (
                  <div>
                    <p className="text-sm text-gray-600">学期费用 | Semester Fee</p>
                    <p className="font-semibold">{program.tuition.currencyCode} {Number(program.tuition.semesterFeeAmount).toLocaleString()}</p>
                  </div>
                )}
                {program.tuition?.isFree && (
                  <Badge>免学费 | Tuition Free</Badge>
                )}
                {program.tuition?.notes && (
                  <p className="text-sm text-gray-600 italic">{program.tuition.notes}</p>
                )}
              </CardContent>
            </Card>

            {/* Accommodation Card */}
            {university?.accommodations && university.accommodations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    住宿 | Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {university.accommodations.map((acc: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <p className="font-semibold text-sm">{acc.typeCn || acc.typeEn}</p>
                        <p className="text-sm text-gray-600">
                          {acc.currencyCode} {Number(acc.monthlyFee).toLocaleString()} / 月 | month
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Official Links */}
            <Card>
              <CardHeader>
                <CardTitle>官方链接 | Official Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {program.officialUrl && (
                  <a
                    href={program.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 break-all"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">项目官网 | Program Website</span>
                  </a>
                )}
                {university?.nameEn && (
                  <a
                    href={`https://www.${university.nameEn.toLowerCase().replace(/\s+/g, '')}.edu`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 break-all"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">学校官网 | University Website</span>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
