import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Globe, BookOpen, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProgramDetail() {
  const [match, params] = useRoute("/program/:id");

  if (!match) return null;

  const programId = parseInt(params?.id || "0");
  const { data: program, isLoading } = trpc.programs.byId.useQuery(
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

  const tuition = program.tuition as any;
  const employment = program.employment as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {program.nameEn}
              </h1>
              <p className="text-xl text-slate-600 mt-2">{program.nameCn}</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {program.degreeType}
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge>{program.universityType === "public" ? "公立" : "私立"}</Badge>
            <Badge variant="outline">{program.durationMonths} 个月</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="fees">学费</TabsTrigger>
                <TabsTrigger value="courses">课程</TabsTrigger>
                <TabsTrigger value="employment">就业</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息 | Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">授课语言 | Languages</p>
                        <p className="font-semibold">
                          {program.teachingLanguage
                            ? JSON.parse(program.teachingLanguage).join(", ")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">学制 | Duration</p>
                        <p className="font-semibold">{program.durationMonths} 个月</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 mb-2">申请要求 | Admission Requirements</p>
                      <div className="bg-slate-50 p-4 rounded text-sm">
                        {program.admissionRequirements
                          ? JSON.stringify(program.admissionRequirements, null, 2)
                          : "N/A"}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 mb-2">项目描述 | Description</p>
                      <p className="text-slate-700">{program.description || "N/A"}</p>
                    </div>

                    {program.officialUrl && (
                      <Button asChild>
                        <a href={program.officialUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          官方项目页面 | Official Program Page
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fees Tab */}
              <TabsContent value="fees">
                <Card>
                  <CardHeader>
                    <CardTitle>学费与住宿 | Tuition & Accommodation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tuition && (
                      <div>
                        <h3 className="font-semibold mb-3">学费 | Tuition Fees</h3>
                        <div className="bg-blue-50 p-4 rounded space-y-2">
                          <div className="flex justify-between">
                            <span>年度学费 | Annual Fee:</span>
                            <span className="font-semibold">
                              {tuition.isFree
                                ? "免学费 | Free"
                                : `${tuition.annualFeeAmount} ${tuition.currencyCode}`}
                            </span>
                          </div>
                          {tuition.rmbAnnualAmount && (
                            <div className="flex justify-between text-slate-600">
                              <span>人民币 | RMB:</span>
                              <span>¥{tuition.rmbAnnualAmount}</span>
                            </div>
                          )}
                          {tuition.semesterFeeAmount && (
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>学期费用 | Per Semester:</span>
                              <span>{tuition.semesterFeeAmount} {tuition.currencyCode}</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-500 pt-2 border-t">
                            汇率参考 | Exchange Rate: 1 {tuition.currencyCode} = {tuition.rmbExchangeRate} RMB
                          </div>
                        </div>
                      </div>
                    )}

                    {university?.accommodations && university.accommodations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">住宿费用 | Accommodation Fees</h3>
                        <div className="space-y-2">
                          {(university.accommodations as any[]).map((acc, idx) => (
                            <div key={idx} className="bg-green-50 p-3 rounded text-sm">
                              <p className="font-semibold">{acc.accommodationType}</p>
                              <p className="text-slate-600">
                                {acc.monthlyFeeMin} - {acc.monthlyFeeMax} {acc.currencyCode} / 月
                              </p>
                              <p className="text-slate-500">
                                ¥{acc.rmbMonthlyMin} - ¥{acc.rmbMonthlyMax} / 月
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>课程设置 | Curriculum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {program.courses && (program.courses as any[]).length > 0 ? (
                      <div className="space-y-3">
                        {(program.courses as any[]).map((course, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                            <p className="font-semibold">{course.nameEn}</p>
                            <p className="text-sm text-slate-600">{course.nameCn}</p>
                            <p className="text-xs text-slate-500">
                              {course.credits} 学分 | Credits
                              {course.isCoreRequired && " • 必修 | Required"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">暂无课程信息 | No course information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment">
                <Card>
                  <CardHeader>
                    <CardTitle>就业前景 | Employment Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {employment ? (
                      <>
                        {employment.employmentRate && (
                          <div>
                            <p className="text-sm text-slate-600 mb-2">就业率 | Employment Rate</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${employment.employmentRate}%` }}
                                />
                              </div>
                              <span className="font-semibold">{employment.employmentRate}%</span>
                            </div>
                          </div>
                        )}

                        {employment.averageSalary && (
                          <div>
                            <p className="text-sm text-slate-600 mb-2">平均起薪 | Average Salary</p>
                            <p className="font-semibold">
                              {typeof employment.averageSalary === "string"
                                ? employment.averageSalary
                                : JSON.stringify(employment.averageSalary)}
                            </p>
                          </div>
                        )}

                        {employment.topEmployers && (
                          <div>
                            <p className="text-sm text-slate-600 mb-2">主要雇主 | Top Employers</p>
                            <div className="flex flex-wrap gap-2">
                              {(employment.topEmployers as any[]).map((employer, idx) => (
                                <Badge key={idx} variant="outline">
                                  {employer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-600">暂无就业数据 | No employment data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* University Card */}
            {university && (
              <Card>
                <CardHeader>
                  <CardTitle>学校信息 | University</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">学校名称 | Name</p>
                    <p className="font-semibold">{university.nameEn}</p>
                    <p className="text-sm text-slate-600">{university.nameCn}</p>
                  </div>

                  {university.qsRanking && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-slate-600">QS 排名</p>
                      <p className="text-2xl font-bold text-blue-600">#{university.qsRanking}</p>
                    </div>
                  )}

                  {university.officialWebsite && (
                    <Button asChild className="w-full">
                      <a href={university.officialWebsite} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        访问学校官网
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Scholarships */}
            {program.scholarships && (program.scholarships as any[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>奖学金 | Scholarships</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(program.scholarships as any[]).map((scholarship, idx) => (
                      <div key={idx} className="text-sm border-b pb-2 last:border-0">
                        <p className="font-semibold">{scholarship.nameEn}</p>
                        <p className="text-slate-600 text-xs">{scholarship.nameCn}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
