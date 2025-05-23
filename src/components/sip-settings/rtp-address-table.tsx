"use client"

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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

const rtpAddresses = [
  {
    id: "rtp-001",
    RTPAddress: "192.168.1.200",
    Name: "Main RTP",
    Remark: "Primary RTP address for main office",
    SIPProvider: "main-endpoint",
  },
  {
    id: "rtp-002",
    RTPAddress: "192.168.1.201",
    Name: "Backup RTP",
    Remark: "Backup RTP address for main office",
    SIPProvider: "main-endpoint",
  },
  {
    id: "rtp-003",
    RTPAddress: "10.0.0.100",
    Name: "Branch Office RTP",
    Remark: "RTP address for branch office",
    SIPProvider: "secondary-endpoint",
  },
  {
    id: "rtp-004",
    RTPAddress: "10.0.0.101",
    Name: "Branch Backup RTP",
    Remark: "Backup RTP address for branch office",
    SIPProvider: "secondary-endpoint",
  },
  {
    id: "rtp-005",
    RTPAddress: "172.16.0.50",
    Name: "Remote Office RTP",
    Remark: "RTP address for remote office",
    SIPProvider: "backup-endpoint",
  },
]

export function RtpAddressTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RTP Address</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SIP Provider</TableHead>
            <TableHead>Remark</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rtpAddresses.map((rtp) => (
            <TableRow key={rtp.id}>
              <TableCell>{rtp.RTPAddress}</TableCell>
              <TableCell>{rtp.Name}</TableCell>
              <TableCell>{rtp.SIPProvider}</TableCell>
              <TableCell className="max-w-[300px] truncate">{rtp.Remark}</TableCell>
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
