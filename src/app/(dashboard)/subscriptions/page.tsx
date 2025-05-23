import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionTable } from "@/components/subscriptions/subscription-table"
import { CreateSubscriptionForm } from "@/components/subscriptions/create-subscription-form"

export default function SubscriptionsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
        <CreateSubscriptionForm />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Manage user subscriptions and plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTable />
        </CardContent>
      </Card>
    </div>
  )
}
