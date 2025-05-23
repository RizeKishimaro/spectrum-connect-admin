"use client"
import { Progress } from "@/components/ui/progress"

export function AgentStatusOverview() {
  const statuses = [
    { status: "AVAILABLE", count: 12, total: 24, color: "bg-green-500" },
    { status: "BUSY", count: 5, total: 24, color: "bg-red-500" },
    { status: "RINGING", count: 1, total: 24, color: "bg-yellow-500" },
    { status: "OFFLINE", count: 6, total: 24, color: "bg-gray-500" },
  ]

  return (
    <div className="space-y-4">
      {statuses.map((status) => (
        <div key={status.status} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{status.status}</span>
            <span className="text-muted-foreground">
              {status.count} / {status.total} agents
            </span>
          </div>
          <Progress value={(status.count / status.total) * 100} className={status.color} />
        </div>
      ))}
    </div>
  )
}
