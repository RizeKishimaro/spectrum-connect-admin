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
import { Company, SIPProvider } from "../../../types/others"

export function CreateCompanyForm() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sipProviders, setSipProviders] = useState<SIPProvider[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    membersCount: "",
    address: "",
    country: "",
    state: "",
    SIPProviderId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  useEffect(() => {
    const fetchSIPProviders = async () => {
      try {
        const response = await axiosClient.get('/sip-provider');
        console.log(response.data)
        setSipProviders(response.data);
      } catch (error) {
        console.error('Nyaa~ failed to fetch companies! 😭', error);
      }
    };
    fetchSIPProviders()
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would make an API call here
      // await fetch('/api/companies', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      await axiosClient.post('/system-company', {
        ...formData,
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Company created",
        description: `${formData.name} has been added successfully.`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        membersCount: "",
        address: "",
        country: "",
        state: "",
        SIPProviderId: "",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
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
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>Add a new company to your call center system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="membersCount">Members Count</Label>
              <Input id="membersCount" value={formData.membersCount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={formData.state} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sIPProviderId">SIP Provider</Label>
              <Select
                value={formData.SIPProviderId}
                onValueChange={(value) => handleSelectChange("SIPProviderId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SIP provider" />
                </SelectTrigger>
                <SelectContent>
                  {sipProviders.length > 0 && sipProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.EndpointName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
