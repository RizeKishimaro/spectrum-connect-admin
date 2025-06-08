
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { usePagination } from "@/lib/usePagination"

interface CallLog {
  id: number
  callerId: string
  callerName: string
  calleeId: string
  systemName: string
  createdAt: string
  duration: string
  timestamp: string
  status: "completed" | "missed" | "transferred"
}

export default function CallLogsPage() {
  const {
    data: callHistory,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    refresh,
    setSearch,
    setLimit,
  } = usePagination<CallLog>({
    route: "/call-logs",
    cacheKey: "call-logs",
  })

  const columns = [
    {
      key: "callerId",
      header: "Caller ID",
      cell: (call: CallLog) => <span className="font-medium">{call.callerId}</span>,
    },
    {
      key: "calleeId",
      header: "Callee Number",
      cell: (call: CallLog) => call.calleeId || "--",
    },
    {
      key: "duration",
      header: "Duration",
      cell: (call: CallLog) => call.duration || "0",
    },
    {
      key: "createdAt",
      header: "Time",
      cell: (call: CallLog) => new Date(call.createdAt).toLocaleString() || "00-00-0000 00:00:00.000",
    },
    {
      key: "systemName",
      header: "Company Name",
      cell: (call: CallLog) => call.systemName || "--",
    },
    {
      key: "status",
      header: "Status",
      cell: (call: CallLog) => (
        <Badge
          variant="outline"
          className={
            call.status === "completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : call.status === "missed"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          }
        >
          {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recent Calls</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={callHistory}
            columns={columns}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onSearch={setSearch}
            onRefresh={refresh}
            onLimitChange={setLimit}
            searchPlaceholder="Search calls..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

