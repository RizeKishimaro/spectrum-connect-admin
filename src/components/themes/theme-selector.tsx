"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { Moon, Sun, Laptop } from "lucide-react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || "system")

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    setTheme(value)
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue={selectedTheme}
        onValueChange={handleThemeChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div>
          <RadioGroupItem value="light" id="light" className="peer sr-only" />
          <Label
            htmlFor="light"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Sun className="mb-3 h-6 w-6" />
            <div className="font-semibold">Light</div>
            <div className="text-sm text-muted-foreground">Light mode for daytime use</div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
          <Label
            htmlFor="dark"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Moon className="mb-3 h-6 w-6" />
            <div className="font-semibold">Dark</div>
            <div className="text-sm text-muted-foreground">Dark mode for nighttime use</div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="system" id="system" className="peer sr-only" />
          <Label
            htmlFor="system"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Laptop className="mb-3 h-6 w-6" />
            <div className="font-semibold">System</div>
            <div className="text-sm text-muted-foreground">Follows your system preferences</div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button onClick={() => setTheme(selectedTheme)}>Apply Theme</Button>
      </div>
    </div>
  )
}
