"use client"

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
import { createUser } from "../../lib/action"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  type Company = {
    id: number
    name: string
  }

  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosClient.get("/system-company")
        setCompanies(response.data)
      } catch (error) {
        console.error("Failed to fetch companies, nyan~ 💔", error)
      }
    }

    fetchCompanies()
  }, [])
  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true)
      await createUser(formData)
      toast({
        title: "Success",
        description: "Agent created successfully",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Create a new agent profile. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <section className="grid gap-4 py-4">
            <fieldset className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter agent name" required />
            </fieldset>
            <fieldset className="grid gap-2">
              <Label htmlFor="sipUser">SIP Username</Label>
              <Input id="sipUser" name="sipUser" placeholder="Enter SIP username" required />
            </fieldset>
            <fieldset className="grid gap-2">
              <Label htmlFor="sipPass">SIP Username</Label>
              <Input id="sipPass" name="sipPass" placeholder="Enter SIP password" required />
            </fieldset>
            <fieldset className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" placeholder="Enter phone number" required />
            </fieldset>
            <fieldset className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="Enter Email" required />
            </fieldset>
            <fieldset className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" placeholder="Enter password" required />
            </fieldset>


            <fieldset className="grid gap-2">
              <Label htmlFor="roles">Roles</Label>
              <Select name="roles" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="company_user">Company User</SelectItem>
                </SelectContent>
              </Select>
            </fieldset>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="OFFLINE" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="AWAY">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <fieldset className="grid gap-2">
              <Label htmlFor="systemCompanyId">Company</Label>
              <Select name="systemCompanyId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </section>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

