
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
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"
import { ComprehensiveSipForm } from "./comprehensive-sip-form"

interface SipSettingsData {
  id: string
  name: string
  sipTech: string
  description?: string
  endpoint?: {
    name: string
    config: Record<string, any>
  }
  auth?: {
    name: string
    config: Record<string, any>
  }
  aor?: {
    name: string
    config: Record<string, any>
  }
  contact?: {
    name: string
    config: Record<string, any>
  }
  identify?: {
    name: string
    config: Record<string, any>
  }
  createdAt?: string
  updatedAt?: string
}

export function SipSettingsTable() {
  const { toast } = useToast()
  const [sipSettings, setSipSettings] = useState<SipSettingsData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSettings, setSelectedSettings] = useState<SipSettingsData | null>(null)

  const fetchSipSettings = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get("/sip-provider")
      console.log(response)
      setSipSettings(response.data)
    } catch (error) {
      console.error("Failed to fetch SIP settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch SIP settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSipSettings()
  }, [])

  const handleEdit = (settings: SipSettingsData) => {
    setSelectedSettings(settings)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (settingsId: string, settingsName: string) => {
    if (!confirm(`Are you sure you want to delete "${settingsName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await axiosClient.delete(`/sip-settings/${settingsId}`)
      toast({
        title: "SIP Settings deleted",
        description: `${settingsName} has been deleted successfully.`,
      })
      fetchSipSettings()
    } catch (error) {
      console.error("Failed to delete SIP settings:", error)
      toast({
        title: "Error",
        description: "Failed to delete SIP settings.",
        variant: "destructive",
      })
    }
  }

  const getSectionCount = (settings: SipSettingsData): number => {
    let count = 0
    if (settings.endpoint) count++
    if (settings.auth) count++
    if (settings.aor) count++
    if (settings.contact) count++
    if (settings.identify) count++
    return count
  }

  const getConfigFieldCount = (config: Record<string, any> | undefined): number => {
    return config ? Object.keys(config).length : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading SIP settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">

      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SIP Technology</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Total Fields</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sipSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No SIP settings found. Create your first SIP configuration to get started.
                </TableCell>
              </TableRow>
            ) : (
              sipSettings.map((settings) => (
                <TableRow key={settings.id}>
                  <TableCell className="font-medium">{settings.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{settings.sipTech}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{settings.description || "No description"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {settings.endpoint && (
                        <Badge variant="secondary" className="text-xs">
                          Endpoint
                        </Badge>
                      )}
                      {settings.auth && (
                        <Badge variant="secondary" className="text-xs">
                          Auth
                        </Badge>
                      )}
                      {settings.aor && (
                        <Badge variant="secondary" className="text-xs">
                          AOR
                        </Badge>
                      )}
                      {settings.contact && (
                        <Badge variant="secondary" className="text-xs">
                          Contact
                        </Badge>
                      )}
                      {settings.identify && (
                        <Badge variant="secondary" className="text-xs">
                          Identify
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getConfigFieldCount(settings.endpoint?.config) +
                      getConfigFieldCount(settings.auth?.config) +
                      getConfigFieldCount(settings.aor?.config) +
                      getConfigFieldCount(settings.contact?.config) +
                      getConfigFieldCount(settings.identify?.config)}{" "}
                    fields
                  </TableCell>
                  <TableCell>
                    {settings.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : "N/A"}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(settings)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(settings.id, settings.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedSettings && (
        <ComprehensiveSipForm
          mode="edit"
          sipSettings={selectedSettings}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedSettings(null)
          }}
          onSettingsUpdated={() => {
            fetchSipSettings()
            setIsEditDialogOpen(false)
            setSelectedSettings(null)
          }}
        />
      )}
    </div>
  )
}

