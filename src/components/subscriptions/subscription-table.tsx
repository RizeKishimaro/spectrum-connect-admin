
"use client"

import React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Search, Plus, Minus } from "lucide-react"
import { usePagination } from "@/lib/usePagination"
import { useToast } from "@/hooks/use-toast"
import axiosClient from "@/lib/axiosClient"

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: string
  active: boolean
  agentCount: number
  maxAgents: number
  startedAt: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

interface SubscriptionTableProps {
  onEdit?: (subscription: Subscription) => void
  refreshTrigger?: number
}

export function SubscriptionTable({ onEdit, refreshTrigger }: SubscriptionTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null)

  const {
    data: subscriptions,
    loading,
    error,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refresh,
    setSearch,
    total,
  } = usePagination<Subscription>({
    route: "/subscriptions",
    limit: 10,
    search: searchTerm,
    cacheKey: "subscriptions",
  })

  // Refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refreshTrigger, refresh])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setSearch(value)
  }

  const handleToggleStatus = async (subscription: Subscription) => {
    try {
      await axiosClient.patch(`/subscriptions/${subscription.id}`, {
        active: !subscription.active,
      })

      toast({
        title: "Subscription updated",
        description: `Subscription has been ${!subscription.active ? "activated" : "deactivated"}.`,
      })

      refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription status.",
        variant: "destructive",
      })
    }
  }

  const handleExtendSubscription = async (subscription: Subscription) => {
    try {
      const currentExpiry = new Date(subscription.expiresAt)
      const newExpiry = new Date(currentExpiry)
      newExpiry.setFullYear(newExpiry.getFullYear() + 1)

      await axiosClient.patch(`/subscriptions/${subscription.id}`, {
        expiresAt: newExpiry.toISOString(),
      })

      toast({
        title: "Subscription extended",
        description: "Subscription has been extended by 1 year.",
      })

      refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend subscription.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubscription = async () => {
    if (!subscriptionToDelete) return

    try {
      await axiosClient.delete(`/subscriptions/${subscriptionToDelete}`)

      toast({
        title: "Subscription deleted",
        description: "Subscription has been permanently deleted.",
      })

      refresh()
      setDeleteDialogOpen(false)
      setSubscriptionToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscription.",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (subscriptionId: string) => {
    setSubscriptionToDelete(subscriptionId)
    setDeleteDialogOpen(true)
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading subscriptions: {error}</p>
        <Button onClick={refresh} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">Total: {total} subscriptions</div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No subscriptions found</p>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.userName}</div>
                      <div className="text-sm text-muted-foreground">{subscription.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {subscription.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isExpired(subscription.expiresAt) ? (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        Expired
                      </Badge>
                    ) : isExpiringSoon(subscription.expiresAt) ? (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        Expiring Soon
                      </Badge>
                    ) : subscription.active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span>{subscription.agentCount}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{subscription.maxAgents}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(subscription.startedAt)}</TableCell>
                  <TableCell>
                    <div className={isExpiringSoon(subscription.expiresAt) ? "text-yellow-600 font-medium" : ""}>
                      {formatDate(subscription.expiresAt)}
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
                        <DropdownMenuItem onClick={() => onEdit?.(subscription)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(subscription)}>
                          {subscription.active ? (
                            <>
                              <Minus className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExtendSubscription(subscription)}>
                          Extend (+1 Year)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(subscription.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={!hasPrevPage}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={!hasNextPage}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscription and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubscription} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

