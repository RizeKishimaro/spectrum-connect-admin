import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SipProviderTable } from "@/components/sip-settings/sip-provider-table"
import { RtpAddressTable } from "@/components/sip-settings/rtp-address-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateSipProviderForm } from "@/components/sip-settings/create-sip-provider-form"
import { CreateRtpAddressForm } from "@/components/sip-settings/create-rtp-address-form"

export default function SipSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">SIP Settings</h2>
      </div>
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">SIP Providers</TabsTrigger>
          <TabsTrigger value="rtp-addresses">RTP Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="providers" className="space-y-4">
          <div className="flex justify-end">
            <CreateSipProviderForm />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>SIP Providers</CardTitle>
              <CardDescription>Manage your SIP providers and their configurations.</CardDescription>
            </CardHeader>
            <CardContent>
              <SipProviderTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rtp-addresses" className="space-y-4">
          <div className="flex justify-end">
            <CreateRtpAddressForm />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>RTP Addresses</CardTitle>
              <CardDescription>Manage RTP addresses for your SIP providers.</CardDescription>
            </CardHeader>
            <CardContent>
              <RtpAddressTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
