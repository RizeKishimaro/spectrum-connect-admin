"use client"

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
import { SIPProvider } from "../../../types/others"
import { useEffect, useState } from "react"
import axiosClient from "@/lib/axiosClient"



export function SipProviderTable() {

  const [sipProviders, setSipProviders] = useState<SIPProvider[]>([])
  useEffect(() => {
    const fetchSipProviders = async () => {
      try {
        const response = await axiosClient.get('/sip-provider');
        console.log(response.data)
        setSipProviders(response.data);
      } catch (error) {
        console.error('Nyaa~ failed to fetch companies! 😭', error);
      }
    };

    fetchSipProviders();
  }, []);
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DID Number</TableHead>
            <TableHead>IP Host</TableHead>
            <TableHead>IP Range</TableHead>
            <TableHead>SIP Username</TableHead>
            <TableHead>SIP Tech</TableHead>
            <TableHead>Endpoint Name</TableHead>
            <TableHead>Call Limit</TableHead>
            <TableHead>Companies</TableHead>
            <TableHead>RTP Addresses</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sipProviders.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell>{provider.DIDNumber}</TableCell>
              <TableCell>{provider.IpHost}</TableCell>
              <TableCell>{provider.IpRange}</TableCell>
              <TableCell>{provider.SipUsername}</TableCell>
              <TableCell>
                <Badge variant="outline">{provider.SipTech}</Badge>
              </TableCell>
              <TableCell>{provider.EndpointName}</TableCell>
              <TableCell>{provider.CallLimit}</TableCell>
              <TableCell>{provider._count.SystemCompany}</TableCell>
              <TableCell>{provider._count.RTPAddress}</TableCell>
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
                    <DropdownMenuItem>
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
  )
}
