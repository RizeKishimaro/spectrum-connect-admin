
"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Phone } from "lucide-react"
import axiosClient from "@/lib/axiosClient"

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

export default function RecentCalls() {
  const [callHistory, setCallHistory] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await axiosClient.get("/call-logs")
        console.log(response.data.data)
        setCallHistory(response.data.data)
      } catch (error) {
        console.error("Failed to fetch call logs, nya~ 😿", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCallLogs()
  }, [])

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recent Calls</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search calls..." className="w-[200px] pl-8 md:w-[300px]" />
          </div>
          <Button>
            <Phone className="mr-2 h-4 w-4" />
            Make Call
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading... please wait nya~ 💤</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller ID</TableHead>
                  <TableHead>Callee Number</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="text-right">Action</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {callHistory.length === 0 ? <p className="text-center text-muted-foreground">No calls found.</p> : callHistory.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.callerId}</TableCell>
                    <TableCell>{call.calleeId || "--"}</TableCell>
                    <TableCell>{call.duration || "0"}</TableCell>
                    <TableCell>{new Date(call.createdAt).toLocaleString() || "00-00-0000 00:00:00.000"}</TableCell>
                    <TableCell>{call.systemName || "--"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    {/* <TableCell className="text-right"> */}
                    {/*   <Button variant="ghost" size="sm"> */}
                    {/*     <Phone className="h-4 w-4" /> */}
                    {/*     <span className="sr-only">Call back</span> */}
                    {/*   </Button> */}
                    {/* </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
