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

const subscriptions = [
  {
    id: "sub-001",
    userId: "user-001",
    userName: "John Doe",
    type: "premium",
    active: true,
    startedAt: "2023-01-15T00:00:00Z",
    expiresAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "sub-002",
    userId: "user-002",
    userName: "Jane Smith",
    type: "basic",
    active: true,
    startedAt: "2023-02-20T00:00:00Z",
    expiresAt: "2024-02-20T00:00:00Z",
  },
  {
    id: "sub-003",
    userId: "user-003",
    userName: "Mike Johnson",
    type: "premium",
    active: false,
    startedAt: "2022-11-10T00:00:00Z",
    expiresAt: "2023-11-10T00:00:00Z",
  },
  {
    id: "sub-004",
    userId: "user-004",
    userName: "Sarah Williams",
    type: "basic",
    active: true,
    startedAt: "2023-03-05T00:00:00Z",
    expiresAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "sub-005",
    userId: "user-005",
    userName: "David Brown",
    type: "premium",
    active: true,
    startedAt: "2023-04-15T00:00:00Z",
    expiresAt: "2024-04-15T00:00:00Z",
  },
]

export function SubscriptionTable() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.userName}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {subscription.type}
                </Badge>
              </TableCell>
              <TableCell>
                {subscription.active ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-500 border-red-500">
                    Expired
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(subscription.startedAt)}</TableCell>
              <TableCell>{formatDate(subscription.expiresAt)}</TableCell>
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
                    <DropdownMenuItem>{subscription.active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                    <DropdownMenuItem>Extend</DropdownMenuItem>
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
