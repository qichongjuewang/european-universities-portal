import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, FileText, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CountryPolicy() {
  const [match, params] = useRoute("/country/:id");

  if (!match) return null;

  const countryId = parseInt(params?.id || "0");
  const { data: country, isLoading } = trpc.countries.byId.useQuery(
    { id: countryId },
    { enabled: !!countryId }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-slate-600">国家信息未找到 | Country not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const visaInfo = country.visaInfo ? JSON.parse(country.visaInfo) : null;
  const residencyInfo = country.residencyInfo ? JSON.parse(country.residencyInfo) : null;
  const greenCardInfo = country.greenCardInfo ? JSON.parse(country.greenCardInfo) : null;
  const costOfLiving = country.costOfLiving ? JSON.parse(country.costOfLiving) : null;
  const touristInfo = country.touristInfo ? JSON.parse(country.touristInfo) : null;
  const officialLinks = country.officialLinks ? JSON.parse(country.officialLinks) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {country.nameCn}
              </h1>
              <p className="text-xl text-slate-600 mt-2">{country.nameEn}</p>
            </div>
            <div className="flex gap-2">
              {country.isEU && <Badge>欧盟 | EU</Badge>}
              {country.isSchengen && <Badge variant="secondary">根申国 | Schengen</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="visa" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visa">签证</TabsTrigger>
            <TabsTrigger value="residency">居留</TabsTrigger>
            <TabsTrigger value="greencard">绿卡</TabsTrigger>
            <TabsTrigger value="living">生活成本</TabsTrigger>
            <TabsTrigger value="tourist">旅游</TabsTrigger>
          </TabsList>

          {/* Visa Tab */}
          <TabsContent value="visa">
            <Card>
              <CardHeader>
                <CardTitle>签证信息 | Visa Information</CardTitle>
                <CardDescription>
                  针对中国留学生和工作者 | For Chinese Students and Workers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {visaInfo ? (
                  <>
                    {visaInfo.studentVisa && (
                      <div>
                        <h3 className="font-semibold mb-2">学生签证 | Student Visa</h3>
                        <div className="bg-blue-50 p-4 rounded space-y-2">
                          {typeof visaInfo.studentVisa === "string" ? (
                            <p>{visaInfo.studentVisa}</p>
                          ) : (
                            Object.entries(visaInfo.studentVisa).map(([key, value]: any) => (
                              <div key={key}>
                                <p className="font-semibold text-sm">{key}</p>
                                <p className="text-slate-700">{value}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {visaInfo.workVisa && (
                      <div>
                        <h3 className="font-semibold mb-2">工作签证 | Work Visa</h3>
                        <div className="bg-green-50 p-4 rounded space-y-2">
                          {typeof visaInfo.workVisa === "string" ? (
                            <p>{visaInfo.workVisa}</p>
                          ) : (
                            Object.entries(visaInfo.workVisa).map(([key, value]: any) => (
                              <div key={key}>
                                <p className="font-semibold text-sm">{key}</p>
                                <p className="text-slate-700">{value}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {visaInfo.requirements && (
                      <div>
                        <h3 className="font-semibold mb-2">申请要求 | Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {(visaInfo.requirements as string[]).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">暂无签证信息 | No visa information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Residency Tab */}
          <TabsContent value="residency">
            <Card>
              <CardHeader>
                <CardTitle>居留政策 | Residency Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {residencyInfo ? (
                  <>
                    {residencyInfo.shortTermResidency && (
                      <div>
                        <h3 className="font-semibold mb-2">短期居留 | Short-term Residency</h3>
                        <p className="text-slate-700">{residencyInfo.shortTermResidency}</p>
                      </div>
                    )}

                    {residencyInfo.longTermResidency && (
                      <div>
                        <h3 className="font-semibold mb-2">长期居留 | Long-term Residency</h3>
                        <p className="text-slate-700">{residencyInfo.longTermResidency}</p>
                      </div>
                    )}

                    {residencyInfo.requirements && (
                      <div>
                        <h3 className="font-semibold mb-2">申请要求 | Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {(residencyInfo.requirements as string[]).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">暂无居留政策信息 | No residency policy information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Green Card Tab */}
          <TabsContent value="greencard">
            <Card>
              <CardHeader>
                <CardTitle>绿卡申请 | Green Card / Permanent Residency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {greenCardInfo ? (
                  <>
                    {greenCardInfo.eligibility && (
                      <div>
                        <h3 className="font-semibold mb-2">申请资格 | Eligibility</h3>
                        <p className="text-slate-700">{greenCardInfo.eligibility}</p>
                      </div>
                    )}

                    {greenCardInfo.requirements && (
                      <div>
                        <h3 className="font-semibold mb-2">申请要求 | Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {(greenCardInfo.requirements as string[]).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {greenCardInfo.processingTime && (
                      <div>
                        <h3 className="font-semibold mb-2">处理时间 | Processing Time</h3>
                        <p className="text-slate-700">{greenCardInfo.processingTime}</p>
                      </div>
                    )}

                    {greenCardInfo.benefits && (
                      <div>
                        <h3 className="font-semibold mb-2">权益 | Benefits</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {(greenCardInfo.benefits as string[]).map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">暂无绿卡申请信息 | No green card information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost of Living Tab */}
          <TabsContent value="living">
            <Card>
              <CardHeader>
                <CardTitle>生活成本 | Cost of Living</CardTitle>
                <CardDescription>
                  针对中国留学生参考 | Reference for Chinese Students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {costOfLiving ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(costOfLiving).map(([key, value]: any) => (
                      <div key={key} className="bg-slate-50 p-4 rounded">
                        <p className="text-sm text-slate-600 mb-1">{key}</p>
                        <p className="text-lg font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">暂无生活成本信息 | No cost of living information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tourist Info Tab */}
          <TabsContent value="tourist">
            <Card>
              <CardHeader>
                <CardTitle>旅游信息 | Tourist Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {touristInfo ? (
                  <>
                    {touristInfo.attractions && (
                      <div>
                        <h3 className="font-semibold mb-2">主要景点 | Main Attractions</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {(touristInfo.attractions as string[]).map((attraction, idx) => (
                            <li key={idx}>{attraction}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {touristInfo.bestTimeToVisit && (
                      <div>
                        <h3 className="font-semibold mb-2">最佳旅游时间 | Best Time to Visit</h3>
                        <p className="text-slate-700">{touristInfo.bestTimeToVisit}</p>
                      </div>
                    )}

                    {touristInfo.transportation && (
                      <div>
                        <h3 className="font-semibold mb-2">交通 | Transportation</h3>
                        <p className="text-slate-700">{touristInfo.transportation}</p>
                      </div>
                    )}

                    {touristInfo.culture && (
                      <div>
                        <h3 className="font-semibold mb-2">文化特色 | Cultural Features</h3>
                        <p className="text-slate-700">{touristInfo.culture}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-600">暂无旅游信息 | No tourist information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Official Links */}
        {officialLinks && Object.keys(officialLinks).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                官方链接 | Official Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(officialLinks).map(([name, url]: any) => (
                  <Button key={name} asChild variant="outline" className="justify-start">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      {name}
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
