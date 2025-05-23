"use client"

import type React from "react"

import { useState } from "react"
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
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CreateRtpAddressForm() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    RTPAddress: "",
    Name: "",
    Remark: "",
    sIPProviderId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would make an API call here
      // await fetch('/api/rtp-addresses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "RTP Address created",
        description: `${formData.Name} has been added successfully.`,
      })

      // Reset form and close dialog
      setFormData({
        RTPAddress: "",
        Name: "",
        Remark: "",
        sIPProviderId: "",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create RTP address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add RTP Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New RTP Address</DialogTitle>
          <DialogDescription>Add a new RTP address to your call center system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="RTPAddress">RTP Address</Label>
                <Input
                  id="RTPAddress"
                  value={formData.RTPAddress}
                  onChange={handleChange}
                  placeholder="192.168.1.200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Name">Name</Label>
                <Input id="Name" value={formData.Name} onChange={handleChange} placeholder="Main RTP" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sIPProviderId">SIP Provider</Label>
              <Select
                value={formData.sIPProviderId}
                onValueChange={(value) => handleSelectChange("sIPProviderId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SIP provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sip-001">main-endpoint</SelectItem>
                  <SelectItem value="sip-002">secondary-endpoint</SelectItem>
                  <SelectItem value="sip-003">backup-endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="Remark">Remark</Label>
              <Textarea
                id="Remark"
                value={formData.Remark}
                onChange={handleChange}
                placeholder="Additional information about this RTP address"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create RTP Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
