
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionTable } from "@/components/subscriptions/subscription-table"
import { CreateSubscriptionForm } from "@/components/subscriptions/create-subscription-form"

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
  description?: string
}

export default function SubscriptionsPage() {
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
  }

  const handleCloseEdit = () => {
    setEditingSubscription(null)
  }

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setEditingSubscription(null)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage user subscriptions and billing plans</p>
        </div>
        <CreateSubscriptionForm onSuccess={handleSuccess} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            View and manage all user subscriptions, including status, agent limits, and expiry dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTable onEdit={handleEdit} refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingSubscription && (
        <CreateSubscriptionForm
          editingSubscription={editingSubscription}
          isEditMode={true}
          onClose={handleCloseEdit}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

