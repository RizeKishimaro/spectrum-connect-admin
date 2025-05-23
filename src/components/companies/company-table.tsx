"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { Company, SIPProvider } from "../../../types/others"
import axiosClient from "@/lib/axiosClient"

const companies = [
  {
    id: 1,
    name: "Acme Inc",
    membersCount: "24",
    address: "123 Main St",
    country: "United States",
    state: "California",
    sipProvider: "main-endpoint",
    agentsCount: 12,
  },
  {
    id: 2,
    name: "TechCorp",
    membersCount: "18",
    address: "456 Tech Blvd",
    country: "United States",
    state: "New York",
    sipProvider: "secondary-endpoint",
    agentsCount: 8,
  },
  {
    id: 3,
    name: "GlobalTel",
    membersCount: "10",
    address: "789 Comm Ave",
    country: "Canada",
    state: "Ontario",
    sipProvider: "backup-endpoint",
    agentsCount: 4,
  },
]

export function CompanyTable() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>({})
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sipProviders, setSipProviders] = useState<SIPProvider[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosClient.get('/system-company');
        console.log(response.data)
        setCompanies(response.data);
      } catch (error) {
        console.error('Nyaa~ failed to fetch companies! 😭', error);
      }
    };
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

    fetchCompanies();
  }, []);

  const handleEdit = (company: any) => {
    setSelectedCompany(company)
    setIsEditDialogOpen(true)
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>State</TableHead>
              <TableHead>SIP Provider</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.membersCount}</TableCell>
                <TableCell>{company.address}</TableCell>
                <TableCell>{company.country}</TableCell>
                <TableCell>{company.state}</TableCell>
                <TableCell>{company.SIPProvider.EndpointName}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {company.agentsCount || 0}
                  </div>
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
                      <DropdownMenuItem onClick={() => handleEdit(company)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information and settings.</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue={selectedCompany.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="membersCount" className="text-right">
                  Members
                </Label>
                <Input id="membersCount" defaultValue={selectedCompany.membersCount} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input id="address" defaultValue={selectedCompany.address} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <Input id="country" defaultValue={selectedCompany.country} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input id="state" defaultValue={selectedCompany.state} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sipProvider" className="text-right">
                  SIP Provider
                </Label>
                {sipProviders.length > 0 && (
                  <Select defaultValue={selectedCompany?.SIPProvider?.id}>
                    <SelectTrigger className="col-span-3">
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

                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
