"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransferConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

// Dummy queue data
const queues = [
  { id: "queue-1", name: "Sales Queue" },
  { id: "queue-2", name: "Support Queue" },
  { id: "queue-3", name: "Billing Queue" },
  { id: "queue-4", name: "Technical Queue" },
  { id: "queue-5", name: "General Inquiries" },
]

export function TransferConfig({ config, onChange }: TransferConfigProps) {
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ destination: e.target.value })
  }

  const handleQueueChange = (value: string) => {
    onChange({ queue: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          value={config.destination || ""}
          onChange={handleDestinationChange}
          placeholder="Enter destination number or SIP address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-queue">Queue (Optional)</Label>
        <Select value={config.queue || ""} onValueChange={handleQueueChange}>
          <SelectTrigger id="transfer-queue">
            <SelectValue placeholder="Select a queue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {queues.map((queue) => (
              <SelectItem key={queue.id} value={queue.id}>
                {queue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
