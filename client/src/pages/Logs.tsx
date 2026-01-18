import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, RefreshCw } from "lucide-react";

type LogLevel = "debug" | "info" | "warn" | "error";

export default function Logs() {
  const [filterLevel, setFilterLevel] = useState<LogLevel | "">("");
  const [filterModule, setFilterModule] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: logs = [], refetch } = trpc.logs.getLogs.useQuery(
    {
      level: filterLevel || undefined,
      module: filterModule || undefined,
      limit: 100,
    },
    { refetchInterval: autoRefresh ? 5000 : false }
  );

  const { data: stats } = trpc.logs.getStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const clearLogsMutation = trpc.logs.clearLogs.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "debug":
        return "bg-gray-100 text-gray-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warn":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">系统日志 | System Logs</h1>
          <p className="text-slate-600">监控和分析系统运行日志 | Monitor and analyze system logs</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">总计 | Total</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">调试 | Debug</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.debug}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">信息 | Info</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.info}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">警告 | Warn</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.warn}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">错误 | Error</p>
                  <p className="text-3xl font-bold text-red-600">{stats.error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>筛选 | Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  日志级别 | Log Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel | "")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">全部 | All</option>
                  <option value="debug">调试 | Debug</option>
                  <option value="info">信息 | Info</option>
                  <option value="warn">警告 | Warn</option>
                  <option value="error">错误 | Error</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  模块 | Module
                </label>
                <Input
                  placeholder="输入模块名 | Enter module name"
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">自动刷新 | Auto Refresh</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新 | Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("确定要清空所有日志吗? | Are you sure to clear all logs?")) {
                      clearLogsMutation.mutate();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空 | Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>日志列表 | Log List</CardTitle>
            <CardDescription>显示最近100条日志 | Showing last 100 logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">时间 | Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">级别 | Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">模块 | Module</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">消息 | Message</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">详情 | Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        暂无日志 | No logs available
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getLevelColor(log.level as LogLevel)}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{log.module}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-md truncate">
                          {log.message}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.data || log.error ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-700">查看</summary>
                              <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(
                                  {
                                    data: log.data,
                                    error: log.error,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </details>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
