"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PhoneIncoming, PhoneOutgoing } from "lucide-react"

const recentCalls = [
  {
    id: "cl-001",
    callerId: "+1234567890",
    calleeId: "+0987654321",
    direction: "INBOUND",
    status: "CONNECTED",
    duration: 245,
    agent: "John Doe",
    createdAt: "2023-05-02T14:30:00Z",
  },
  {
    id: "cl-002",
    callerId: "+1234567891",
    calleeId: "+0987654322",
    direction: "OUTBOUND",
    status: "HUNGUP",
    duration: 180,
    agent: "Jane Smith",
    createdAt: "2023-05-02T14:25:00Z",
  },
  {
    id: "cl-003",
    callerId: "+1234567892",
    calleeId: "+0987654323",
    direction: "INBOUND",
    status: "MISSED",
    duration: 0,
    agent: null,
    createdAt: "2023-05-02T14:20:00Z",
  },
  {
    id: "cl-004",
    callerId: "+1234567893",
    calleeId: "+0987654324",
    direction: "OUTBOUND",
    status: "CONNECTED",
    duration: 320,
    agent: "Mike Johnson",
    createdAt: "2023-05-02T14:15:00Z",
  },
  {
    id: "cl-005",
    callerId: "+1234567894",
    calleeId: "+0987654325",
    direction: "INBOUND",
    status: "TRANSFERRED",
    duration: 150,
    agent: "Sarah Williams",
    createdAt: "2023-05-02T14:10:00Z",
  },
]

export function RecentCalls() {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "-"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-500"
      case "HUNGUP":
        return "bg-gray-500"
      case "MISSED":
        return "bg-red-500"
      case "TRANSFERRED":
        return "bg-blue-500"
      case "RINGING":
        return "bg-yellow-500"
      case "FAILED":
        return "bg-red-700"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Agent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentCalls.map((call) => (
          <TableRow key={call.id}>
            <TableCell>{formatTime(call.createdAt)}</TableCell>
            <TableCell>
              {call.direction === "INBOUND" ? (
                <div className="flex items-center">
                  <PhoneIncoming className="mr-2 h-4 w-4 text-green-500" />
                  <span>Inbound</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <PhoneOutgoing className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Outbound</span>
                </div>
              )}
            </TableCell>
            <TableCell>{call.callerId}</TableCell>
            <TableCell>{call.calleeId || "-"}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
            </TableCell>
            <TableCell>{formatDuration(call.duration)}</TableCell>
            <TableCell>{call.agent || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
