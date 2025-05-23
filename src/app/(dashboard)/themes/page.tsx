import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeSelector } from "@/components/themes/theme-selector"
import { ColorCustomizer } from "@/components/themes/color-customizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ThemesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Themes</h2>
      </div>
      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="themes">Theme Selection</TabsTrigger>
          <TabsTrigger value="colors">Color Customization</TabsTrigger>
        </TabsList>
        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Selection</CardTitle>
              <CardDescription>Choose a theme for your admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Customization</CardTitle>
              <CardDescription>Customize the colors of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <ColorCustomizer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
