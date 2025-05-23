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

type Company = {
  id: string;
  name: string;
  membersCount: string;
  address: string;
  country: string;
  state: string;
  sIPProviderId: string;
  SIPTech: string;
};

export function CreateAgentForm() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    sipUname: "",
    sipPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    status: "AVAILABLE",
    systemCompanyId: "",
    SIPTech: "",
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosClient.get('/system-company');
        setCompanies(response.data); // 🥺 assumes it's an array of Company
      } catch (error) {
        console.error('Nyaa~ failed to fetch companies! 😭', error);
      }
    };

    fetchCompanies();
  }, []);

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
      // await fetch('/api/agents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Simulate API call
      axiosClient.post('/agents', {
        ...formData,
        systemCompanyId: Number(formData.systemCompanyId)
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Agent created",
        description: `${formData.firstName} ${formData.lastName} has been added successfully.`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        sipUname: "",
        sipPassword: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        status: "AVAILABLE",
        systemCompanyId: "",
        SIPTech: "",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
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
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>Add a new agent to your call center system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <Input id="sipPassword" type="password" value={formData.sipPassword} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">SIP Tech</Label>
              <Select value={formData.SIPTech} onValueChange={(value) => handleSelectChange("SIPTech", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PJSIP">PJSIP</SelectItem>
                  <SelectItem value="SIP">SIP</SelectItem>
                  <SelectItem value="SKINNY">Skinny</SelectItem>
                  <SelectItem value="IAX">Interior Asterisk eXchange(IAX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Select value={formData.systemCompanyId} onValueChange={(value) => handleSelectChange('systemCompanyId', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.name} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
