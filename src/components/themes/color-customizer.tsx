"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ColorCustomizer() {
  const [primaryColor, setPrimaryColor] = useState("#adfa1d")
  const [secondaryColor, setSecondaryColor] = useState("#0ea5e9")
  const [accentColor, setAccentColor] = useState("#f97316")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#333333")

  const handleApplyColors = () => {
    // In a real implementation, this would update a theme configuration
    // or apply CSS variables to the document root
    console.log("Applying colors:", {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Colors</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex space-x-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: primaryColor }} />
                <Input
                  id="primary-color"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex space-x-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: secondaryColor }} />
                <Input
                  id="secondary-color"
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex space-x-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: accentColor }} />
                <Input
                  id="accent-color"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex space-x-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: backgroundColor }} />
                <Input
                  id="background-color"
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex space-x-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: textColor }} />
                <Input id="text-color" type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="border-radius">Border Radius (px)</Label>
              <Input id="border-radius" type="number" defaultValue={4} min={0} max={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Base Font Size (px)</Label>
              <Input id="font-size" type="number" defaultValue={16} min={12} max={24} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spacing">Base Spacing (px)</Label>
              <Input id="spacing" type="number" defaultValue={4} min={2} max={12} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="p-6 rounded-lg border" style={{ backgroundColor }}>
          <h4 className="text-xl font-bold mb-2" style={{ color: textColor }}>
            Theme Preview
          </h4>
          <p className="mb-4" style={{ color: textColor }}>
            This is how your theme will look with the selected colors.
          </p>
          <div className="flex space-x-4">
            <Button
              style={{
                backgroundColor: primaryColor,
                color: "#ffffff",
                border: "none",
              }}
            >
              Primary Button
            </Button>
            <Button
              variant="outline"
              style={{
                borderColor: secondaryColor,
                color: secondaryColor,
              }}
            >
              Secondary Button
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleApplyColors}>Apply Colors</Button>
      </div>
    </div>
  )
}
