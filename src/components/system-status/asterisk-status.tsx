
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Phone, PhoneCall, Server } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axiosClient from "@/lib/axiosClient"

export default function AsteriskStatus() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [asteriskData, setAsteriskData] = useState<any>(null)

  useEffect(() => {
    const fetchAsteriskStatus = async () => {
      try {
        setLoading(true)
        const response = await axiosClient("/system-manager/asterisk/status")



        const data = await response.data
        setAsteriskData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch Asterisk status")
        console.error("Error fetching Asterisk status:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAsteriskStatus()

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchAsteriskStatus, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // Parse uptime from the response
  const getUptime = () => {
    if (!asteriskData?.uptime || !asteriskData.uptime[0]) return "Unknown"
    const uptimeText = asteriskData.uptime[0]
    return uptimeText.replace("System uptime: ", "")
  }

  // Parse active calls count
  const getActiveCalls = () => {
    if (!asteriskData?.activeCalls) return { active: 0, total: 0 }

    const activeCallsLine = asteriskData.activeCalls.find((line: string) => line.includes("active call"))
    const activeChannels = asteriskData.activeCalls
      .filter((line: string) => line.startsWith("PJSIP/"))
      .map((line: string) => {
        const match = line.match(/^(PJSIP\/[^\s]+)/)
        return match ? match[1] : null
      })
      .filter(Boolean) // remove nulls


    if (!activeCallsLine) return { active: 0, total: 0 }

    const activeCallsMatch = activeCallsLine.match(/(\d+) active call/)
    const active = activeCallsMatch ? Number.parseInt(activeCallsMatch[1]) : 0

    // Assuming max calls is 50 for now, could be fetched from config
    return { active, total: 50, activeChannels }
  }

  // Parse PJSIP peers
  const getPjsipPeers = () => {
    if (!asteriskData?.pjsipPeers) return { online: 0, offline: 0, total: 0, endpoints: [] }

    const objectsFoundLine = asteriskData.pjsipPeers.find((line: string) => line.includes("Objects found:"))

    const totalMatch = objectsFoundLine ? objectsFoundLine.match(/Objects found: (\d+)/) : null
    const total = totalMatch ? Number.parseInt(totalMatch[1]) : 0

    // Count available vs unavailable endpoints
    const availableCount = asteriskData.pjsipPeers.filter(
      (line: string) => line.includes("Not in use") || line.includes("Available"),
    ).length

    // Extract endpoint information for the table
    const endpoints: any[] = []
    let currentEndpoint: any = null

    asteriskData.pjsipPeers.forEach((line: string) => {
      // Skip header lines with placeholder text
      if (line.includes("<Endpoint/CID") || line.includes("<State.....>")) {
        return
      }

      const endpointMatch = line.match(/Endpoint:\s+(\S+)\s+(\S+)/)
      const channelMatch = line.match(/Channel:\s+(\S+)\s+(\S+)/)


      if (endpointMatch) {
        if (currentEndpoint) {
          endpoints.push(currentEndpoint)
        }

        // Map the status correctly
        let status = endpointMatch[2]
        if (status === "Not") {
          status = "Available"
        } else if (status.includes("In")) {
          status = "Incall"
        }

        currentEndpoint = {
          name: endpointMatch[1],
          status: status,
          type: "PJSIP",
          calls: channelMatch?.length,
        }
      }

      // Try to extract channel count (active calls)
      if (currentEndpoint && line.includes("Channels")) {
        const channelsMatch = line.match(/(\d+) of/)
        if (channelsMatch) {
          currentEndpoint.calls = Number.parseInt(channelsMatch[1])
        }
      }
    })

    if (currentEndpoint) {
      endpoints.push(currentEndpoint)
    }

    return {
      online: availableCount,
      offline: total - availableCount,
      total,
      endpoints,
    }
  }
  const getSystemVersionDetails = () => {
    if (!asteriskData?.systemVersion) {
      return {
        version: "Unknown",
        builder: "Unknown",
        host: "Unknown",
        arch: "Unknown",
        os: "Unknown",
        buildDate: "Unknown",
      }
    }

    const versionStr = asteriskData.systemVersion

    // Extract version number
    const versionMatch = versionStr.match(/Asterisk (\d+\.\d+\.\d+)/)
    const version = versionMatch ? versionMatch[1] : "Unknown"

    // Extract builder
    const builderMatch = versionStr.match(/built by ([^ ]+)/)
    const builder = builderMatch ? builderMatch[1] : "Unknown"

    // Extract host
    const hostMatch = versionStr.match(/@ ([^ ]+)/)
    const host = hostMatch ? hostMatch[1] : "Unknown"

    // Extract architecture
    const archMatch = versionStr.match(/on a ([^ ]+)/)
    const arch = archMatch ? archMatch[1] : "Unknown"

    // Extract OS
    const osMatch = versionStr.match(/running ([^ ]+)/)
    const os = osMatch ? osMatch[1] : "Unknown"

    // Extract build date
    const dateMatch = versionStr.match(/on (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+)$/)
    const buildDate = dateMatch ? dateMatch[1] : "Unknown"

    return {
      version,
      builder,
      host,
      arch,
      os,
      buildDate,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Asterisk status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load Asterisk status: {error}</AlertDescription>
      </Alert>
    )
  }

  const uptime = getUptime()
  const { active: activeCalls, total: maxCalls, activeChannels } = getActiveCalls()
  const { online: onlinePeers, offline: offlinePeers, total: totalPeers, endpoints } = getPjsipPeers()
  const versionDetails = getSystemVersionDetails()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-center justify-center">
        <Card className="md:col-span-2 items-center">
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">System Version</div>
            </div>
            <div className="text-2xl font-bold mb-2">Asterisk {versionDetails.version}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Built by:</span> {versionDetails.builder}
              </div>
              <div>
                <span className="text-muted-foreground">Host:</span> {versionDetails.host}
              </div>
              <div>
                <span className="text-muted-foreground">Architecture:</span> {versionDetails.arch}
              </div>
              <div>
                <span className="text-muted-foreground">OS:</span> {versionDetails.os}
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Build date:</span> {versionDetails.buildDate}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Uptime</div>
            </div>
            <div className="text-lg font-bold">{uptime}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Active Calls</div>
            </div>
            <div className="text-2xl font-bold">{activeCalls}</div>
            <Progress value={(activeCalls / maxCalls) * 100} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {activeCalls} of {maxCalls} max calls
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="pt-6 flex flex-col h-full ">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">SIP Peers</div>
            </div>
            <div className="text-2xl font-bold">
              {onlinePeers}/{totalPeers}
            </div>
            <Progress value={(onlinePeers / (totalPeers || 1)) * 100} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {onlinePeers} online, {offlinePeers} offline, {activeChannels.length} In call
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 h-full">
          <CardContent className="pt-6 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-2">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Active Channels</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {activeChannels && activeChannels.map((channel: string, index: number) => {
                return (
                  <p key={index} className="text-md font-bold mb-2">{channel}</p>
                )
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.length > 0 ? (
              endpoints.map((endpoint) => (
                <TableRow key={endpoint.name}>
                  <TableCell className="font-medium">{endpoint.name}</TableCell>
                  <TableCell>{endpoint.type}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        endpoint.status === "Available"
                          ? "bg-green-500"
                          : endpoint.status === "Incall"
                            ? "bg-blue-500"
                            : "bg-red-500"
                      }
                    >
                      {endpoint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>0</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No endpoints found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground text-right">Last updated: {new Date().toLocaleTimeString()}</div>
    </div>
  )
}

