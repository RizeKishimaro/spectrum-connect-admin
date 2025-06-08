
"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { AddUserDialog } from "@/components/user-management/add-user-dialog"
import { EditUserDialog } from "@/components/user-management/edit-user-dialog"
import { DeleteUserDialog } from "@/components/user-management/delete-user-dialog"
import { usePagination } from "@/lib/usePagination"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/action"

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const {
    data: users,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    refresh,
    setSearch,
    setLimit,
  } = usePagination<User>({
    route: "/user",
    cacheKey: "users",
    include: ["systemCompany"],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500"
      case "BUSY":
        return "bg-red-500"
      case "RINGING":
        return "bg-yellow-500"
      case "OFFLINE":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
      OFFLINE: { variant: "secondary" as const, className: "" },
      BUSY: { variant: "destructive" as const, className: "" },
      AWAY: { variant: "outline" as const, className: "" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OFFLINE

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowEditDialog(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleSuccess = () => {
    refresh()
    toast({
      title: "Success",
      description: "Operation completed successfully",
    })
  }

  const columns = [
    {
      key: "email",
      header: "Name",
      cell: (user: User) => <span className="font-medium">{user.email}</span>,
    },
    {
      key: "sipUser",
      header: "SIP Username",
    },
    {
      key: "status",
      header: "Status",
      cell: (user: User) => <Badge className={getStatusColor(user.status)}>{user.status}</Badge>,
    },
    {
      key: "roles",
      header: "Role",
    },
    {
      key: "systemCompany",
      header: "Company",
      cell: (user: User) => user.systemCompany?.name || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Management</CardTitle>
          <CardDescription>Manage your call center agents, their status, and assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onSearch={setSearch}
            onRefresh={refresh}
            onLimitChange={setLimit}
            searchPlaceholder="Search agents..."
          />
        </CardContent>
      </Card>

      <AddUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleSuccess} />

      {selectedUser && (
        <>
          <EditUserDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
          <DeleteUserDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  )
}

