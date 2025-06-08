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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, Plus, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"

interface SipField {
  key: string
  value: string
}

interface SipSection {
  name: string
  config: Record<string, any>
}

interface SipSettingsData {
  id?: string
  name: string
  sipTech: string
  description?: string
  endpoint?: SipSection
  auth?: SipSection
  aor?: SipSection
  contact?: SipSection
  identify?: SipSection
}

interface ComprehensiveSipFormProps {
  mode?: "create" | "edit"
  sipSettings?: SipSettingsData
  isOpen?: boolean
  onClose?: () => void
  onSettingsUpdated?: () => void
}

export function ComprehensiveSipForm({
  mode = "create",
  sipSettings,
  isOpen,
  onClose,
  onSettingsUpdated,
}: ComprehensiveSipFormProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Basic form data
  const [formData, setFormData] = useState({
    name: "",
    sipTech: "PJSIP",
    description: "",
  })

  // Dynamic fields for each section
  const [endpointFields, setEndpointFields] = useState<SipField[]>([
    { key: "type", value: "endpoint" },
    { key: "transport", value: "transport-ws" },
    { key: "context", value: "outbound" },
    { key: "disallow", value: "all" },
    { key: "allow", value: "ulaw,alaw" },
    { key: "webrtc", value: "yes" },
  ])

  const [authFields, setAuthFields] = useState<SipField[]>([
    { key: "type", value: "auth" },
    { key: "auth_type", value: "userpass" },
  ])

  const [aorFields, setAorFields] = useState<SipField[]>([
    { key: "type", value: "aor" },
    { key: "max_contacts", value: "1" },
  ])

  const [contactFields, setContactFields] = useState<SipField[]>([{ key: "type", value: "contact" }])

  const [identifyFields, setIdentifyFields] = useState<SipField[]>([{ key: "type", value: "identify" }])

  // Bulk input states
  const [endpointBulk, setEndpointBulk] = useState("")
  const [authBulk, setAuthBulk] = useState("")
  const [aorBulk, setAorBulk] = useState("")
  const [contactBulk, setContactBulk] = useState("")
  const [identifyBulk, setIdentifyBulk] = useState("")

  // Control dialog state
  const dialogOpen = mode === "edit" ? (isOpen ?? false) : open
  const setDialogOpen = mode === "edit" ? (onClose ? () => onClose() : () => { }) : setOpen

  // Convert config object to field array
  const configToFields = (config: Record<string, any>): SipField[] => {
    return Object.entries(config).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  }

  // Convert field array to config object
  const fieldsToConfig = (fields: SipField[]): Record<string, any> => {
    const config: Record<string, any> = {}
    fields.forEach((field) => {
      if (field.key && field.value) {
        // Convert numeric values
        const numericFields = ["max_contacts", "call_limit", "max_audio_streams", "max_video_streams"]
        if (numericFields.includes(field.key) && !isNaN(Number(field.value))) {
          config[field.key] = Number(field.value)
        } else {
          config[field.key] = field.value
        }
      }
    })
    return config
  }

  // Parse bulk input (key=value format)
  const parseBulkInput = (bulkText: string): SipField[] => {
    return bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=")
        return {
          key: key.trim(),
          value: valueParts.join("=").trim(),
        }
      })
  }

  // Apply bulk input to fields
  const applyBulkInput = (
    bulkText: string,
    currentFields: SipField[],
    setFields: React.Dispatch<React.SetStateAction<SipField[]>>,
  ) => {
    if (!bulkText.trim()) return

    const newFields = parseBulkInput(bulkText)
    const updatedFields = [...currentFields]

    newFields.forEach((newField) => {
      const existingIndex = updatedFields.findIndex((f) => f.key === newField.key)
      if (existingIndex >= 0) {
        updatedFields[existingIndex] = newField
      } else {
        updatedFields.push(newField)
      }
    })

    setFields(updatedFields)
  }

  // Field management functions
  const addField = (fields: SipField[], setFields: React.Dispatch<React.SetStateAction<SipField[]>>) => {
    setFields([...fields, { key: "", value: "" }])
  }

  const updateField = (
    index: number,
    field: "key" | "value",
    value: string,
    fields: SipField[],
    setFields: React.Dispatch<React.SetStateAction<SipField[]>>,
  ) => {
    const updatedFields = [...fields]
    updatedFields[index][field] = value
    setFields(updatedFields)
  }

  const removeField = (
    index: number,
    fields: SipField[],
    setFields: React.Dispatch<React.SetStateAction<SipField[]>>,
  ) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  // Load existing data for editing
  useEffect(() => {
    if (mode === "edit" && sipSettings) {
      setFormData({
        name: sipSettings.name || "",
        sipTech: sipSettings.sipTech || "PJSIP",
        description: sipSettings.description || "",
      })

      if (sipSettings.endpoint?.config) {
        setEndpointFields(configToFields(sipSettings.endpoint.config))
      }
      if (sipSettings.auth?.config) {
        setAuthFields(configToFields(sipSettings.auth.config))
      }
      if (sipSettings.aor?.config) {
        setAorFields(configToFields(sipSettings.aor.config))
      }
      if (sipSettings.contact?.config) {
        setContactFields(configToFields(sipSettings.contact.config))
      }
      if (sipSettings.identify?.config) {
        setIdentifyFields(configToFields(sipSettings.identify.config))
      }
    }
  }, [mode, sipSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      sipTech: "PJSIP",
      description: "",
    })

    setEndpointFields([
      { key: "type", value: "endpoint" },
      { key: "transport", value: "transport-ws" },
      { key: "context", value: "outbound" },
      { key: "disallow", value: "all" },
      { key: "allow", value: "ulaw,alaw" },
      { key: "webrtc", value: "yes" },
    ])

    setAuthFields([
      { key: "type", value: "auth" },
      { key: "auth_type", value: "userpass" },
    ])

    setAorFields([
      { key: "type", value: "aor" },
      { key: "max_contacts", value: "1" },
    ])

    setContactFields([{ key: "type", value: "contact" }])
    setIdentifyFields([{ key: "type", value: "identify" }])

    setEndpointBulk("")
    setAuthBulk("")
    setAorBulk("")
    setContactBulk("")
    setIdentifyBulk("")
    setActiveTab("basic")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: SipSettingsData = {
        ...formData,
        endpoint: {
          name: formData.name,
          config: fieldsToConfig(endpointFields),
        },
        auth: {
          name: `${formData.name}-auth`,
          config: fieldsToConfig(authFields),
        },
        aor: {
          name: formData.name,
          config: fieldsToConfig(aorFields),
        },
        contact: {
          name: `${formData.name}-contact`,
          config: fieldsToConfig(contactFields),
        },
        identify: {
          name: `${formData.name}-identify`,
          config: fieldsToConfig(identifyFields),
        },
      }

      if (mode === "edit" && sipSettings?.id) {
        await axiosClient.patch(`/sip-settings/${sipSettings.id}`, payload)
        toast({
          title: "SIP Settings updated",
          description: `${formData.name} has been updated successfully.`,
        })
        onSettingsUpdated?.()
      } else {
        await axiosClient.post("/sip-provider", payload)
        toast({
          title: "SIP Settings created",
          description: `${formData.name} has been created successfully.`,
        })
      }

      resetForm()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error submitting SIP settings:", error)
      toast({
        title: "Error",
        description: `Failed to ${mode} SIP settings. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderFieldSection = (
    title: string,
    fields: SipField[],
    setFields: React.Dispatch<React.SetStateAction<SipField[]>>,
    bulkValue: string,
    setBulkValue: React.Dispatch<React.SetStateAction<string>>,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>Configure {title.toLowerCase()} settings with custom properties</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Fields */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Individual Fields</Label>
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Property"
                value={field.key}
                onChange={(e) => updateField(index, "key", e.target.value, fields, setFields)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateField(index, "value", e.target.value, fields, setFields)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeField(index, fields, setFields)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField(fields, setFields)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {/* Bulk Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bulk Input (key=value format)</Label>
          <Textarea
            placeholder={`ice_support=yes\nmedia_encryption=sdes\nmax_audio_streams=1`}
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            rows={4}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              applyBulkInput(bulkValue, fields, setFields)
              setBulkValue("")
            }}
            disabled={!bulkValue.trim()}
          >
            Apply Bulk Input
          </Button>
        </div>

        {/* Current Configuration Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Configuration</Label>
          <div className="flex flex-wrap gap-1">
            {fields
              .filter((f) => f.key && f.value)
              .map((field, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {field.key}={field.value}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const DialogComponent = mode === "edit" ? Dialog : Dialog

  return (
    <DialogComponent open={dialogOpen} onOpenChange={setDialogOpen}>
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add SIP Settings
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit SIP Settings" : "Create New SIP Settings"}</DialogTitle>
          <DialogDescription>
            Configure comprehensive SIP settings with endpoint, auth, AOR, contact, and identify sections.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="core">Core SIP</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">SIP Settings Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., main-trunk, agent-template"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sipTech">SIP Technology</Label>
                  <Select value={formData.sipTech} onValueChange={(value) => handleSelectChange("sipTech", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SIP technology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJSIP">PJSIP</SelectItem>
                      <SelectItem value="SIP">SIP</SelectItem>
                      <SelectItem value="SKINNY">SKINNY</SelectItem>
                      <SelectItem value="IAX">IAX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the purpose of these SIP settings..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="core" className="space-y-4">
              {renderFieldSection("Endpoint", endpointFields, setEndpointFields, endpointBulk, setEndpointBulk)}
              {renderFieldSection("Authentication", authFields, setAuthFields, authBulk, setAuthBulk)}
              {renderFieldSection("AOR (Address of Record)", aorFields, setAorFields, aorBulk, setAorBulk)}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {renderFieldSection("Contact", contactFields, setContactFields, contactBulk, setContactBulk)}
              {renderFieldSection("Identify", identifyFields, setIdentifyFields, identifyBulk, setIdentifyBulk)}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Preview</CardTitle>
                  <CardDescription>
                    Preview of the final JSON structure that will be sent to the backend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(
                      {
                        name: formData.name,
                        sipTech: formData.sipTech,
                        description: formData.description,
                        endpoint: {
                          name: formData.name,
                          config: fieldsToConfig(endpointFields),
                        },
                        auth: {
                          name: `${formData.name}-auth`,
                          config: fieldsToConfig(authFields),
                        },
                        aor: {
                          name: formData.name,
                          config: fieldsToConfig(aorFields),
                        },
                        contact: {
                          name: `${formData.name}-contact`,
                          config: fieldsToConfig(contactFields),
                        },
                        identify: {
                          name: `${formData.name}-identify`,
                          config: fieldsToConfig(identifyFields),
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                  ? "Update SIP Settings"
                  : "Create SIP Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogComponent>
  )
}

