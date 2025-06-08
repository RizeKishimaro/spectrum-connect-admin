
"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Calendar, Settings, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"

interface I_User {
  id: string
  name: string
  email: string
}

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: string
  active: boolean
  agentCount: number
  maxAgents: number
  startedAt: string
  expiresAt: string
  description?: string
}

interface CreateSubscriptionFormProps {
  editingSubscription?: Subscription | null
  isEditMode?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

export function CreateSubscriptionForm({
  editingSubscription,
  isEditMode = false,
  onClose,
  onSuccess,
}: CreateSubscriptionFormProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<I_User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [formData, setFormData] = useState({
    userId: "",
    type: "basic",
    active: true,
    maxAgents: 5,
    startedAt: new Date().toISOString().split("T")[0],
    expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    description: "",
  })

  // Load form data when editing
  useEffect(() => {
    if (isEditMode && editingSubscription) {
      setFormData({
        userId: editingSubscription.userId,
        type: editingSubscription.type,
        active: editingSubscription.active,
        maxAgents: editingSubscription.maxAgents,
        startedAt: editingSubscription.startedAt.split("T")[0],
        expiresAt: editingSubscription.expiresAt.split("T")[0],
        description: editingSubscription.description || "",
      })
      setOpen(true)
    }
  }, [isEditMode, editingSubscription])

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const response = await axiosClient.get("/users")
        setUsers(response.data.data || response.data || [])
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "Failed to load users.",
          variant: "destructive",
        })
      } finally {
        setLoadingUsers(false)
      }
    }

    if (open) {
      fetchUsers()
    }
  }, [open, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
  }

  const validateForm = () => {
    if (!formData.userId) {
      toast({
        title: "Validation Error",
        description: "Please select a user.",
        variant: "destructive",
      })
      return false
    }

    if (formData.maxAgents < 1) {
      toast({
        title: "Validation Error",
        description: "Max agents must be at least 1.",
        variant: "destructive",
      })
      return false
    }

    const startDate = new Date(formData.startedAt)
    const endDate = new Date(formData.expiresAt)

    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "Expiry date must be after start date.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        startedAt: new Date(formData.startedAt).toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
      }

      if (isEditMode && editingSubscription) {
        await axiosClient.patch(`/subscriptions/${editingSubscription.id}`, payload)
        toast({
          title: "Subscription updated",
          description: "Subscription has been updated successfully.",
        })
      } else {
        await axiosClient.post("/subscriptions", payload)
        toast({
          title: "Subscription created",
          description: "New subscription has been created successfully.",
        })
      }

      // Reset form and close dialog
      setFormData({
        userId: "",
        type: "basic",
        active: true,
        maxAgents: 5,
        startedAt: new Date().toISOString().split("T")[0],
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        description: "",
      })

      setOpen(false)
      onSuccess?.()
      onClose?.()
    } catch (error: any) {
      console.error("Subscription operation failed:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Operation failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const getMaxAgentsByType = (type: string) => {
    switch (type) {
      case "basic":
        return 5
      case "premium":
        return 25
      case "enterprise":
        return 100
      default:
        return 5
    }
  }

  const handleTypeChange = (type: string) => {
    const maxAgents = getMaxAgentsByType(type)
    setFormData((prev) => ({
      ...prev,
      type,
      maxAgents: Math.min(prev.maxAgents, maxAgents),
    }))
  }

  return (
    <Dialog open={isEditMode ? true : open} onOpenChange={isEditMode ? handleClose : setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditMode ? "Edit Subscription" : "Create New Subscription"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update subscription details and settings." : "Add a new subscription to your system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="flex items-center gap-2">
                {/* @ts-expect-error */}
                <User className="h-4 w-4" />
                User
              </Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => handleSelectChange("userId", value)}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subscription Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Subscription Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div>
                        <div className="font-medium">Basic</div>
                        <div className="text-sm text-muted-foreground">Up to 5 agents</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div>
                        <div className="font-medium">Premium</div>
                        <div className="text-sm text-muted-foreground">Up to 25 agents</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div>
                        <div className="font-medium">Enterprise</div>
                        <div className="text-sm text-muted-foreground">Up to 100 agents</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAgents">Max Agents</Label>
                <Input
                  id="maxAgents"
                  type="number"
                  value={formData.maxAgents}
                  onChange={handleChange}
                  min="1"
                  max={getMaxAgentsByType(formData.type)}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startedAt" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input id="startedAt" type="date" value={formData.startedAt} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input id="expiresAt" type="date" value={formData.expiresAt} onChange={handleChange} required />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange("active", checked)}
              />
              <Label htmlFor="active">Active Subscription</Label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional notes about this subscription..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Subscription"
                  : "Create Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

