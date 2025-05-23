"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IVRNode, IVRNodeType } from "@/components/ivr/ivr-tree-editor"
import { Trash2 } from "lucide-react"
import { AgentTransferConfig } from "@/components/ivr/node-configs/agent-transfer-config"
import { PlayAudioConfig } from "@/components/ivr/node-configs/play-audio-config"
import { PlaySoundWithDTMFConfig } from "@/components/ivr/node-configs/play-sound-with-dtmf-config"
import { TransferConfig } from "@/components/ivr/node-configs/transfer-config"

interface IVRNodeEditorProps {
  node?: IVRNode
  parentNodeId?: string
  onSave: (node: IVRNode, isNew?: boolean) => void
  onDelete?: (nodeId: string) => void
  onCancel?: () => void
  isNew?: boolean
}

export function IVRNodeEditor({ node, parentNodeId, onSave, onDelete, onCancel, isNew = false }: IVRNodeEditorProps) {

  const [nodeData, setNodeData] = useState<IVRNode>(() => {
    return node
      ? { ...node }
      : {
        id: uuidv4(),
        type: "PlayAudio" as IVRNodeType,
        label: "New Node",
        parentId: parentNodeId || null,
        children: [],
        config: {},
      }
  })

  // Update nodeData when props change (for editing mode)
  useEffect(() => {
    if (node) {
      setNodeData({ ...node })
    }
  }, [node])

  // Update config when node type changes

  useEffect(() => {
    const defaultConfigs: Record<IVRNodeType, any> = {
      AgentTransfer: { queue: "" },
      PlayAudio: { audioFile: null },
      PlayAudioBackground: { audioFile: null },
      PlaySoundWithDTMFAccept: { acceptDigits: "", saveToDatabase: false },
      HangUp: {},
      Transfer: { destination: "", queue: "" },
    }

    if (!node) {
      setNodeData((prev) => ({
        ...prev,
        config: defaultConfigs[prev.type as IVRNodeType] || {},
      }))
    }
  }, [nodeData.type, node])


  const handleTypeChange = (type: string) => {
    setNodeData((prev) => ({
      ...prev,
      type: type as IVRNodeType,
    }))
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeData((prev) => ({
      ...prev,
      label: e.target.value,
    }))
  }

  const handleConfigChange = (config: Record<string, any>) => {
    setNodeData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...config,
      },
    }))
  }



  const handleSave = () => {
    // Generate a new UUID for new nodes or keep the existing one for edited nodes
    const updatedNode = {
      ...nodeData,
      id: nodeData.id || uuidv4(), // Use uuidv4() to generate new IDs for new nodes
      parentId: isNew ? parentNodeId : nodeData.parentId, // Ensure root node has parentId as null, others retain existing parentId
      children: nodeData.children || [], // Ensure children are set correctly
    };

    // If it's a root node, make sure parentId is null
    if (updatedNode.type === "AgentTransfer" && updatedNode.parentId === null) {
      updatedNode.parentId = null;
    }

    // Clean up children to avoid circular reference (self-loop)
    updatedNode.children = updatedNode.children.filter((childId) => childId !== updatedNode.id);

    // Debug the final updated node
    console.log("Saving node:", updatedNode);

    onSave(updatedNode, isNew);
  };



  const handleDelete = () => {
    if (onDelete) {
      onDelete(nodeData.id)
    }
  }

  const renderConfigEditor = () => {
    switch (nodeData.type) {
      case "AgentTransfer":
        return <AgentTransferConfig config={nodeData.config} onChange={handleConfigChange} />
      case "PlayAudio":
      case "PlayAudioBackground":
        return <PlayAudioConfig config={nodeData.config} onChange={handleConfigChange} />
      case "PlaySoundWithDTMFAccept":
        return <PlaySoundWithDTMFConfig config={nodeData.config} onChange={handleConfigChange} />
      case "Transfer":
        return <TransferConfig config={nodeData.config} onChange={handleConfigChange} />
      case "HangUp":
        return <div className="text-sm text-muted-foreground py-2">No additional configuration needed for Hang Up.</div>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-4">{isNew ? "Add New Node" : "Edit Node"}</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Node Label</Label>
            <Input
              id="node-label"
              value={nodeData.label}
              onChange={handleLabelChange}
              placeholder="Enter a descriptive name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-type">Node Type</Label>
            <Select value={nodeData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="node-type">
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AgentTransfer">Agent Transfer</SelectItem>
                <SelectItem value="PlayAudio">Play Audio</SelectItem>
                <SelectItem value="PlayAudioBackground">Play Audio Background</SelectItem>
                <SelectItem value="PlaySoundWithDTMFAccept">Play Sound With DTMF Accept</SelectItem>
                <SelectItem value="HangUp">Hang Up</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          <div>
            <h4 className="text-sm font-medium mb-2">Configuration</h4>
            {renderConfigEditor()}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div>
          {!isNew && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>{isNew ? "Add Node" : "Save Changes"}</Button>
        </div>
      </div>
    </div>
  )
}
