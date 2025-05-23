"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PlaySoundWithDTMFConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

export function PlaySoundWithDTMFConfig({ config, onChange }: PlaySoundWithDTMFConfigProps) {
  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ acceptDigits: e.target.value })
  }

  const handleSaveToDbChange = (checked: boolean) => {
    onChange({ saveToDatabase: checked })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accept-digits">Accept Digits (0-9)</Label>
        <Input
          id="accept-digits"
          value={config.acceptDigits || ""}
          onChange={handleDigitsChange}
          placeholder="e.g. 123456789"
          maxLength={10}
        />
        <p className="text-xs text-muted-foreground">Enter the digits that should be accepted as valid input</p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="save-to-db" checked={config.saveToDatabase || false} onCheckedChange={handleSaveToDbChange} />
        <Label htmlFor="save-to-db" className="text-sm font-normal">
          Insert into database
        </Label>
      </div>
    </div>
  )
}
