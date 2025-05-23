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
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"



export function CreateSipProviderForm() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    IpHost: "",
    IpRange: "",
    SipUsername: "",
    SipPassword: "",
    SipTech: "PJSIP",
    AccessToken: "",
    CallLimit: "50",
    EndpointName: "",
    DIDNumber: "",
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // await fetch('/api/sip-providers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Simulate API call
      await axiosClient.post('/sip-provider', formData)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "SIP Provider created",
        description: `${formData.EndpointName} has been added successfully.`,
      })

      // Reset form and close dialog
      setFormData({
        IpHost: "",
        IpRange: "",
        SipUsername: "",
        SipPassword: "",
        SipTech: "PJSIP",
        AccessToken: "",
        CallLimit: "50",
        EndpointName: "",
        DIDNumber: "",
      })
      setOpen(false)
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to create SIP provider. Please try again.",
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
          Add SIP Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New SIP Provider</DialogTitle>
          <DialogDescription>Add a new SIP provider to your call center system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="IpHost">IP Host</Label>
                <Input
                  id="IpHost"
                  value={formData.IpHost}
                  onChange={handleChange}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="IpRange">IP Range</Label>
                <Input
                  id="IpRange"
                  value={formData.IpRange}
                  onChange={handleChange}
                  placeholder="192.168.1.0/24"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="DIDNumber">DID Number</Label>
              <Input id="DIDNumber" type="tel" value={formData.DIDNumber} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="SipUsername">SIP Username</Label>
                <Input id="SipUsername" value={formData.SipUsername} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SipPassword">SIP Password</Label>
                <Input id="SipPassword" type="password" value={formData.SipPassword} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="SipTech">SIP Technology</Label>
                <Select value={formData.SipTech} onValueChange={(value) => handleSelectChange("SipTech", value)}>
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
                <Label htmlFor="EndpointName">Endpoint Name</Label>
                <Input id="EndpointName" value={formData.EndpointName} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="AccessToken">Access Token</Label>
                <Input id="AccessToken" value={formData.AccessToken} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="CallLimit">Call Limit</Label>
                <Input id="CallLimit" type="number" value={formData.CallLimit} onChange={handleChange} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create SIP Provider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
