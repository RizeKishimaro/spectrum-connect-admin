
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import axiosClient from "@/lib/axiosClient"
import type { Agent } from "../../../types/others"
import { EditAgentForm } from "./edit-agent-form"

type Company = {
  name: string
  membersCount: string
  address: string
  country: string
  state: string
  sIPProviderId: string
}
const agents = [
  {
    id: "agent-001",
    name: "John Doe",
    sipUname: "john.doe",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567890",
    status: "AVAILABLE",
    systemCompany: "Acme Inc",
  },
  {
    id: "agent-002",
    name: "Jane Smith",
    sipUname: "jane.smith",
    firstName: "Jane",
    lastName: "Smith",
    phoneNumber: "+0987654321",
    status: "BUSY",
    systemCompany: "Acme Inc",
  },
  {
    id: "agent-003",
    name: "Mike Johnson",
    sipUname: "mike.johnson",
    firstName: "Mike",
    lastName: "Johnson",
    phoneNumber: "+1122334455",
    status: "OFFLINE",
    systemCompany: "TechCorp",
  },
  {
    id: "agent-004",
    name: "Sarah Williams",
    sipUname: "sarah.williams",
    firstName: "Sarah",
    lastName: "Williams",
    phoneNumber: "+5566778899",
    status: "AVAILABLE",
    systemCompany: "TechCorp",
  },
  {
    id: "agent-005",
    name: "David Brown",
    sipUname: "david.brown",
    firstName: "David",
    lastName: "Brown",
    phoneNumber: "+1231231234",
    status: "RINGING",
    systemCompany: "GlobalTel",
  },
]
export function AgentTable() {
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [agents, setAgents] = useState<Agent[]>([])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500"
      case "BUSY":
        return "bg-red-500"
      case "RINGING":
        return "bg-yellow-500"
      case "OFFLINE":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAgentUpdated = () => {
    fetchAgents() // Refresh the agents list
  }

  const fetchAgents = async () => {
    try {
      const response = await axiosClient.get("/agents")
      console.log(response.data)
      setAgents(response.data)
    } catch (error) {
      console.error("Nyaa~ failed to fetch agents! 😭", error)
    }
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosClient.get("/system-company")
        console.log(response.data)
        setCompanies(response.data)
      } catch (error) {
        console.error("Nyaa~ failed to fetch companies! 😭", error)
      }
    }
    fetchAgents()
    fetchCompanies()
  }, [])

  const handleEdit = (agent: any) => {
    setSelectedAgent(agent)
    setIsEditDialogOpen(true)
  }
  const handleDelete = async (agentId: string) => {
    try {
      await axiosClient.delete(`/agents/${agentId}`)
      console.log("Agent deleted successfully! 💖")
      fetchAgents() // Refresh the list
    } catch (error: any) {
      console.error("Mou~ error while deleting agent! 💔", error.response?.data || error.message)
      throw error
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await axiosClient.post("/agents", handleSubmit)
      console.log("Agent created successfully! 💖", response.data)

      setIsEditDialogOpen(false)
      return response.data
    } catch (error: any) {
      console.error("Mou~ error while creating agent! 💔", error.response?.data || error.message)
      throw error
    }
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SIP Username</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent: Agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>{agent.sipUname}</TableCell>
                <TableCell>{agent.phoneNumber}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(agent.status)}>{agent.status}</Badge>
                </TableCell>
                <TableCell>{agent?.systemCompany?.name}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(agent)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(agent.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <EditAgentForm
        agent={selectedAgent}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onAgentUpdated={handleAgentUpdated}
      />
    </div>
  )
}

