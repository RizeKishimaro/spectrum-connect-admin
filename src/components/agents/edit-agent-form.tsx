"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"

type Company = {
  id: string
  name: string
  membersCount: string
  address: string
  country: string
  state: string
  sIPProviderId: string
  SIPTech: string
}

type CustomField = {
  id: string
  key: string
  value: string
}

type SectionConfig = {
  [key: string]: string | number
}

interface EditAgentFormProps {
  agent: any
  isOpen: boolean
  onClose: () => void
  onAgentUpdated: () => void
}

export function EditAgentForm({ agent, isOpen, onClose, onAgentUpdated }: EditAgentFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  const [formData, setFormData] = useState({
    name: "",
    sipUname: "",
    sipPassword: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    status: "AVAILABLE",
    systemCompanyId: "",
    SIPTech: "PJSIP",
  })

  // Dynamic configuration sections
  const [endpointFields, setEndpointFields] = useState<CustomField[]>([])
  const [authFields, setAuthFields] = useState<CustomField[]>([])
  const [aorFields, setAorFields] = useState<CustomField[]>([])
  const [contactFields, setContactFields] = useState<CustomField[]>([])
  const [identifyFields, setIdentifyFields] = useState<CustomField[]>([])

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosClient.get("/system-company")
        setCompanies(response.data)
      } catch (error) {
        console.error("Failed to fetch companies!", error)
      }
    }

    fetchCompanies()
  }, [])

  // Populate form data when agent changes
  useEffect(() => {
    if (agent && isOpen) {
      // Populate basic form data
      setFormData({
        name: agent.name || "",
        sipUname: agent.sipUname || "",
        sipPassword: agent.sipPassword || "",
        password: agent.password || "",
        firstName: agent.firstName || "",
        lastName: agent.lastName || "",
        phoneNumber: agent.phoneNumber || "",
        status: agent.status || "AVAILABLE",
        systemCompanyId: agent.systemCompany?.id?.toString() || "",
        SIPTech: agent.SIPTech || "PJSIP",
      })

      // Populate configuration fields from existing data
      populateConfigFields()
    }
  }, [agent, isOpen])

  const populateConfigFields = async () => {
    try {
      // Fetch detailed agent configuration from backend
      const response = await axiosClient.get(`/agents/${agent.id}`)
      const agentData = response.data

      // Convert config objects to field arrays
      if (agentData.endpoint?.config) {
        setEndpointFields(configToFields(agentData.endpoint.config, "endpoint"))
      } else {
        setEndpointFields([
          { id: "1", key: "type", value: "endpoint" },
          { id: "2", key: "transport", value: "transport-ws" },
          { id: "3", key: "context", value: "outbound" },
          { id: "4", key: "disallow", value: "all" },
          { id: "5", key: "allow", value: "ulaw,alaw" },
          { id: "6", key: "webrtc", value: "yes" },
        ])
      }

      if (agentData.auth?.config) {
        setAuthFields(configToFields(agentData.auth.config, "auth"))
      } else {
        setAuthFields([
          { id: "1", key: "type", value: "auth" },
          { id: "2", key: "auth_type", value: "userpass" },
        ])
      }

      if (agentData.aor?.config) {
        setAorFields(configToFields(agentData.aor.config, "aor"))
      } else {
        setAorFields([
          { id: "1", key: "type", value: "aor" },
          { id: "2", key: "max_contacts", value: "1" },
        ])
      }

      if (agentData.contact?.config) {
        setContactFields(configToFields(agentData.contact.config, "contact"))
      } else {
        setContactFields([])
      }

      if (agentData.identify?.config) {
        setIdentifyFields(configToFields(agentData.identify.config, "identify"))
      } else {
        setIdentifyFields([])
      }
    } catch (error) {
      console.error("Failed to fetch agent configuration:", error)
      // Set default values if fetch fails
      setEndpointFields([
        { id: "1", key: "type", value: "endpoint" },
        { id: "2", key: "transport", value: "transport-ws" },
        { id: "3", key: "context", value: "outbound" },
        { id: "4", key: "disallow", value: "all" },
        { id: "5", key: "allow", value: "ulaw,alaw" },
        { id: "6", key: "webrtc", value: "yes" },
      ])
      setAuthFields([
        { id: "1", key: "type", value: "auth" },
        { id: "2", key: "auth_type", value: "userpass" },
      ])
      setAorFields([
        { id: "1", key: "type", value: "aor" },
        { id: "2", key: "max_contacts", value: "1" },
      ])
    }
  }

  // Convert config object to fields array
  const configToFields = (config: any, section: string): CustomField[] => {
    return Object.entries(config).map(([key, value], index) => ({
      id: `${section}-${index}`,
      key,
      value: String(value),
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Function to add a new custom field to a section
  const addCustomField = (section: string) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      key: "",
      value: "",
    }

    switch (section) {
      case "endpoint":
        setEndpointFields((prev) => [...prev, newField])
        break
      case "auth":
        setAuthFields((prev) => [...prev, newField])
        break
      case "aor":
        setAorFields((prev) => [...prev, newField])
        break
      case "contact":
        setContactFields((prev) => [...prev, newField])
        break
      case "identify":
        setIdentifyFields((prev) => [...prev, newField])
        break
    }
  }

  // Function to remove a custom field from a section
  const removeCustomField = (section: string, fieldId: string) => {
    switch (section) {
      case "endpoint":
        setEndpointFields((prev) => prev.filter((field) => field.id !== fieldId))
        break
      case "auth":
        setAuthFields((prev) => prev.filter((field) => field.id !== fieldId))
        break
      case "aor":
        setAorFields((prev) => prev.filter((field) => field.id !== fieldId))
        break
      case "contact":
        setContactFields((prev) => prev.filter((field) => field.id !== fieldId))
        break
      case "identify":
        setIdentifyFields((prev) => prev.filter((field) => field.id !== fieldId))
        break
    }
  }

  // Function to update a custom field
  const updateCustomField = (section: string, fieldId: string, key: string, value: string) => {
    const updateField = (fields: CustomField[]) =>
      fields.map((field) => (field.id === fieldId ? { ...field, [key]: value } : field))

    switch (section) {
      case "endpoint":
        setEndpointFields(updateField)
        break
      case "auth":
        setAuthFields(updateField)
        break
      case "aor":
        setAorFields(updateField)
        break
      case "contact":
        setContactFields(updateField)
        break
      case "identify":
        setIdentifyFields(updateField)
        break
    }
  }

  // Function to parse custom input string (key=value format)
  const parseCustomInput = (input: string, section: string) => {
    const lines = input.split("\n").filter((line) => line.trim() !== "")
    const newFields: CustomField[] = lines.map((line, index) => {
      const [key, ...valueParts] = line.split("=")
      return {
        id: `custom-${Date.now()}-${index}`,
        key: key?.trim() || "",
        value: valueParts.join("=").trim() || "",
      }
    })

    switch (section) {
      case "endpoint":
        setEndpointFields((prev) => [...prev, ...newFields])
        break
      case "auth":
        setAuthFields((prev) => [...prev, ...newFields])
        break
      case "aor":
        setAorFields((prev) => [...prev, ...newFields])
        break
      case "contact":
        setContactFields((prev) => [...prev, ...newFields])
        break
      case "identify":
        setIdentifyFields((prev) => [...prev, ...newFields])
        break
    }
  }

  // Function to convert fields array to config object
  const fieldsToConfig = (fields: CustomField[]): SectionConfig => {
    return fields.reduce((config, field) => {
      if (field.key && field.value) {
        // Convert numeric strings to numbers for specific fields
        const numericFields = ["max_contacts", "port", "timeout"]
        const value = numericFields.includes(field.key) ? Number(field.value) || field.value : field.value
        config[field.key] = value
      }
      return config
    }, {} as SectionConfig)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Build the payload with dynamic configuration
      const payload: any = {
        ...formData,
        systemCompanyId: Number(formData.systemCompanyId),
      }

      // Add endpoint configuration
      if (endpointFields.length > 0) {
        const endpointConfig = fieldsToConfig(endpointFields)
        // Ensure auth and aors references are set
        endpointConfig.auth = `${formData.sipUname}-auth`
        endpointConfig.aors = formData.sipUname

        payload.endpoint = {
          name: formData.sipUname,
          config: endpointConfig,
        }
      }

      // Add auth configuration
      if (authFields.length > 0) {
        const authConfig = fieldsToConfig(authFields)
        // Ensure username and password are set
        authConfig.username = formData.sipUname
        authConfig.password = formData.sipPassword

        payload.auth = {
          name: `${formData.sipUname}-auth`,
          config: authConfig,
        }
      }

      // Add aor configuration
      if (aorFields.length > 0) {
        payload.aor = {
          name: formData.sipUname,
          config: fieldsToConfig(aorFields),
        }
      }

      // Add contact configuration if fields exist
      if (contactFields.length > 0) {
        payload.contact = {
          name: `${formData.sipUname}-contact`,
          config: fieldsToConfig(contactFields),
        }
      }

      // Add identify configuration if fields exist
      if (identifyFields.length > 0) {
        payload.identify = {
          name: `${formData.sipUname}-identify`,
          config: fieldsToConfig(identifyFields),
        }
      }

      // Use PATCH request for updating
      await axiosClient.patch(`/agents/${agent.id}`, payload)

      toast({
        title: "Agent updated",
        description: `${formData.firstName} ${formData.lastName} has been updated successfully.`,
      })

      onAgentUpdated()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Component to render custom fields for a section
  const renderCustomFields = (fields: CustomField[], section: string, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Button type="button" variant="outline" size="sm" onClick={() => addCustomField(section)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input
              placeholder="Property"
              value={field.key}
              onChange={(e) => updateCustomField(section, field.id, "key", e.target.value)}
              className="flex-1"
            />
            <span>=</span>
            <Input
              placeholder="Value"
              value={field.value}
              onChange={(e) => updateCustomField(section, field.id, "value", e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => removeCustomField(section, field.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Bulk input for custom properties */}
        <div className="mt-4">
          <Label>Bulk Add Properties (key=value, one per line)</Label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md"
            rows={3}
            placeholder={`Example:\nmax_audio_streams=1\nice_support=yes\nmedia_encryption=sdes`}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                parseCustomInput(e.target.value, section)
                e.target.value = ""
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>Update agent information and PJSIP/SIP configuration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="core-config">Core Config</TabsTrigger>
              <TabsTrigger value="advanced-config">Advanced Config</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sipUname">SIP Username</Label>
                  <Input id="sipUname" value={formData.sipUname} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sipPassword">SIP Password</Label>
                  <Input
                    id="sipPassword"
                    type="password"
                    value={formData.sipPassword}
                    onChange={handleChange}
                    placeholder="Leave empty to keep current password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Backend Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={""}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="SIPTech">SIP Tech</Label>
                  <Select value={formData.SIPTech} onValueChange={(value) => handleSelectChange("SIPTech", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SIP Tech" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJSIP">PJSIP</SelectItem>
                      <SelectItem value="SIP">SIP</SelectItem>
                      <SelectItem value="SKINNY">Skinny</SelectItem>
                      <SelectItem value="IAX">IAX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="BUSY">Busy</SelectItem>
                      <SelectItem value="RINGING">Ringing</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemCompanyId">Company</Label>
                  <Select
                    value={formData.systemCompanyId}
                    onValueChange={(value) => handleSelectChange("systemCompanyId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="core-config" className="space-y-4">
              {renderCustomFields(endpointFields, "endpoint", "Endpoint Configuration")}
              {renderCustomFields(authFields, "auth", "Authentication Configuration")}
              {renderCustomFields(aorFields, "aor", "AOR Configuration")}
            </TabsContent>

            <TabsContent value="advanced-config" className="space-y-4">
              {renderCustomFields(contactFields, "contact", "Contact Configuration")}
              {renderCustomFields(identifyFields, "identify", "Identify Configuration")}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

