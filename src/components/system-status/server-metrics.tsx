"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const cpuData = [
  { time: "00:00", value: 35 },
  { time: "01:00", value: 28 },
  { time: "02:00", value: 25 },
  { time: "03:00", value: 24 },
  { time: "04:00", value: 22 },
  { time: "05:00", value: 29 },
  { time: "06:00", value: 42 },
  { time: "07:00", value: 55 },
  { time: "08:00", value: 68 },
  { time: "09:00", value: 75 },
  { time: "10:00", value: 72 },
  { time: "11:00", value: 78 },
  { time: "12:00", value: 82 },
]

const memoryData = [
  { time: "00:00", value: 45 },
  { time: "01:00", value: 46 },
  { time: "02:00", value: 45 },
  { time: "03:00", value: 44 },
  { time: "04:00", value: 43 },
  { time: "05:00", value: 45 },
  { time: "06:00", value: 48 },
  { time: "07:00", value: 52 },
  { time: "08:00", value: 58 },
  { time: "09:00", value: 65 },
  { time: "10:00", value: 68 },
  { time: "11:00", value: 72 },
  { time: "12:00", value: 75 },
]

export function ServerMetrics() {
  const serverMetrics = {
    cpu: 78,
    memory: 75,
    disk: 62,
    network: 45,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium mb-2">CPU Usage</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{serverMetrics.cpu}%</div>
              <div className="text-xs text-muted-foreground">Last 12 hours</div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={cpuData}>
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#adfa1d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium mb-2">Memory Usage</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{serverMetrics.memory}%</div>
              <div className="text-xs text-muted-foreground">Last 12 hours</div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={memoryData}>
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium">Disk Usage</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-2xl font-bold">{serverMetrics.disk}%</div>
              <div className="text-xs text-muted-foreground">38.2 GB used of 60 GB</div>
            </div>
            <Progress value={serverMetrics.disk} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium">Network Usage</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-2xl font-bold">{serverMetrics.network}%</div>
              <div className="text-xs text-muted-foreground">45 Mbps of 100 Mbps</div>
            </div>
            <Progress value={serverMetrics.network} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
