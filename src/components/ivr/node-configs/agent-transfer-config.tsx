"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AgentTransferConfigProps {
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

export function AgentTransferConfig({ config, onChange }: AgentTransferConfigProps) {
  const handleQueueChange = (value: string) => {
    onChange({ queue: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="queue">Select Queue</Label>
        <Select value={config.queue || ""} onValueChange={handleQueueChange}>
          <SelectTrigger id="queue">
            <SelectValue placeholder="Select a queue" />
          </SelectTrigger>
          <SelectContent>
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
