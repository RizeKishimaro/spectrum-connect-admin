import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentTable } from "@/components/agents/agent-table"
import { CreateAgentForm } from "@/components/agents/create-agent-form"

export default function AgentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
        <CreateAgentForm />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agent Management</CardTitle>
          <CardDescription>Manage your call center agents, their status, and assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentTable />
        </CardContent>
      </Card>
    </div>
  )
}
