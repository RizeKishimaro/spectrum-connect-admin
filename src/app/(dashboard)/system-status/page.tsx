import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemStatusOverview } from "@/components/system-status/system-status-overview"
import { ServerMetrics } from "@/components/system-status/server-metrics"
import AsteriskStatus from "@/components/system-status/asterisk-status"

export default function SystemStatusPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Status</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="asterisk">Asterisk</TabsTrigger>
          <TabsTrigger value="server">Server Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status Overview</CardTitle>
              <CardDescription>Current status of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatusOverview />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="asterisk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asterisk Status</CardTitle>
              <CardDescription>Detailed status of Asterisk PBX</CardDescription>
            </CardHeader>
            <CardContent>
              <AsteriskStatus />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Metrics</CardTitle>
              <CardDescription>Server performance and resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ServerMetrics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
