"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, XCircle, Activity, Server, Phone, Database, Users } from "lucide-react"

export function SystemStatusOverview() {
  const services = [
    {
      name: "Asterisk PBX",
      status: "operational",
      icon: Phone,
      description: "Call processing system",
      lastUpdated: "2 minutes ago",
    },
    {
      name: "Database",
      status: "operational",
      icon: Database,
      description: "PostgreSQL database",
      lastUpdated: "5 minutes ago",
    },
    {
      name: "SIP Trunks",
      status: "degraded",
      icon: Activity,
      description: "External SIP connections",
      lastUpdated: "10 minutes ago",
      message: "High latency on provider 2",
    },
    {
      name: "Web Server",
      status: "operational",
      icon: Server,
      description: "Admin interface server",
      lastUpdated: "3 minutes ago",
    },
    {
      name: "Agent Portal",
      status: "operational",
      icon: Users,
      description: "Agent web interface",
      lastUpdated: "7 minutes ago",
    },
    {
      name: "Call Recording",
      status: "incident",
      icon: Server,
      description: "Call recording storage",
      lastUpdated: "15 minutes ago",
      message: "Disk space running low",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "incident":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Operational"
      case "degraded":
        return "Degraded Performance"
      case "incident":
        return "Incident Reported"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card key={service.name}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
            <service.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(service.status)}
              <span className="font-medium">{getStatusText(service.status)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
            {service.message && (
              <p className="text-xs mt-2 font-medium text-yellow-600 dark:text-yellow-400">{service.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">Last updated: {service.lastUpdated}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
