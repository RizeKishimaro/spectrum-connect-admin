
"use client"

import { useState, useCallback } from "react"
import Tree from "react-d3-tree"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"
import { Phone, Play, KeyRound, Plus, Copy, Check, Edit, ZoomIn, ZoomOut, Maximize, Database } from "lucide-react"

// --- Types ---
type IVRNode = {
  id: string
  name: string
  action: "Playback" | "PlayWithDTMF" | "transfer"
  parameter?: [string, { option: string[] }]
  dtmfKey?: string
  audioFile?: string
  option?: string[]
  insertDatabase?: boolean
  children?: IVRNode[]
}

// Convert IVRNode to D3 compatible format
const convertToD3Format = (node: IVRNode) => {
  return {
    name: node.name,
    id: node.id,
    action: node.action,
    dtmfKey: node.dtmfKey,
    audioFile: node.audioFile,
    insertDatabase: node.insertDatabase,
    parameter: node.parameter,
    option: node.option,
    children: node.children ? node.children.map(convertToD3Format) : [],
  }
}

// --- Component ---
export default function IVRTreeBuilder() {
  const [ivrTree, setIvrTree] = useState<IVRNode>({
    id: nanoid(),
    name: "Main IVR",
    action: "Playback",
    parameter: ["hello-world", { option: ["default"] }],
    audioFile: "welcome",
    insertDatabase: false,
    children: [],
  })

  // Tree navigation state
  const [translate, setTranslate] = useState({ x: 400, y: 80 })
  const [zoom, setZoom] = useState(1)

  // Add node state
  const [selectedNode, setSelectedNode] = useState<IVRNode | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [nodeName, setNodeName] = useState("")
  const [action, setAction] = useState<"Playback" | "PlayWithDTMF" | "transfer">("Playback")
  const [dtmfKey, setDtmfKey] = useState("")
  const [audioFile, setAudioFile] = useState("")
  const [insertDatabase, setInsertDatabase] = useState(false)

  // Edit node state
  const [editingNode, setEditingNode] = useState<IVRNode | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editNodeName, setEditNodeName] = useState("")
  const [editAction, setEditAction] = useState<"Playback" | "PlayWithDTMF" | "transfer">("Playback")
  const [editDtmfKey, setEditDtmfKey] = useState("")
  const [editAudioFile, setEditAudioFile] = useState("")
  const [editInsertDatabase, setEditInsertDatabase] = useState(false)

  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.4))
  }

  const handleResetView = () => {
    setTranslate({ x: 400, y: 80 })
    setZoom(1)
  }

  // Add node functionality
  const handleAddNode = () => {
    if (!selectedNode || !nodeName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the node",
        variant: "destructive",
      })
      return
    }

    const newNode: IVRNode = {
      id: nanoid(),
      name: nodeName,
      action,
      dtmfKey: dtmfKey || undefined,
      parameter: ["custom-message", { option: ["value"] }],
      audioFile: action === "Playback" || action === "PlayWithDTMF" ? audioFile || "default-audio" : undefined,
      insertDatabase,
      children: [],
    }

    const updatedTree = addNodeToTree(ivrTree, selectedNode.id, newNode)
    setIvrTree(updatedTree)
    setIsAddModalOpen(false)
    setNodeName("")
    setDtmfKey("")
    setAudioFile("")
    setInsertDatabase(false)

    toast({
      title: "Node added",
      description: `Added "${nodeName}" to "${selectedNode.name}"`,
    })
  }

  const addNodeToTree = (tree: IVRNode, parentId: string, newNode: IVRNode): IVRNode => {
    if (tree.id === parentId) {
      return {
        ...tree,
        children: [...(tree.children || []), newNode],
      }
    }
    return {
      ...tree,
      children: tree.children?.map((child) => addNodeToTree(child, parentId, newNode)) || [],
    }
  }

  // Edit node functionality
  const openEditModal = (node: IVRNode) => {
    setEditingNode(node)
    setEditNodeName(node.name)
    setEditAction(node.action)
    setEditDtmfKey(node.dtmfKey || "")
    setEditAudioFile(node.audioFile || "")
    setEditInsertDatabase(node.insertDatabase || false)
    setIsEditModalOpen(true)
  }

  const handleEditNode = () => {
    if (!editingNode || !editNodeName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the node",
        variant: "destructive",
      })
      return
    }

    const updatedTree = updateNodeInTree(ivrTree, editingNode.id, {
      ...editingNode,
      name: editNodeName,
      action: editAction,
      dtmfKey: editDtmfKey || undefined,
      audioFile:
        editAction === "Playback" || editAction === "PlayWithDTMF" ? editAudioFile || "default-audio" : undefined,
      insertDatabase: editInsertDatabase,
    })

    setIvrTree(updatedTree)
    setIsEditModalOpen(false)

    toast({
      title: "Node updated",
      description: `Updated "${editNodeName}" successfully`,
    })
  }

  const updateNodeInTree = (tree: IVRNode, nodeId: string, updatedNode: IVRNode): IVRNode => {
    if (tree.id === nodeId) {
      return {
        ...tree,
        ...updatedNode,
        children: tree.children, // Preserve children
      }
    }

    return {
      ...tree,
      children: tree.children?.map((child) => updateNodeInTree(child, nodeId, updatedNode)) || [],
    }
  }

  // Node styling and rendering
  const getNodeIcon = (action: string) => {
    switch (action) {
      case "Playback":
        return <Play className="h-4 w-4 text-green-600" />
      case "PlayWithDTMF":
        return <KeyRound className="h-4 w-4 text-blue-600" />
      case "transfer":
        return <Phone className="h-4 w-4 text-red-600" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getNodeColor = (action: string) => {
    switch (action) {
      case "Playback":
        return "border-green-800 bg-green-950/40"
      case "PlayWithDTMF":
        return "border-blue-800 bg-blue-950/40"
      case "transfer":
        return "border-red-800 bg-red-950/40"
      default:
        return "border-gray-700"
    }
  }

  const renderCustomNode = useCallback(({ nodeDatum }: any) => {
    return (
      <foreignObject width={220} height={140} x={-110} y={-70}>
        <div
          className={`p-3 rounded-lg shadow-sm border-2 ${getNodeColor(nodeDatum.action)} transition-all hover:shadow-md bg-background/80`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm truncate max-w-[140px] dark:text-gray-200" title={nodeDatum.name}>
              {nodeDatum.name}
            </div>
            <Badge variant="outline" className="text-xs flex items-center gap-1 dark:border-gray-700">
              {getNodeIcon(nodeDatum.action)}
              <span className="text-[10px]">{nodeDatum.action}</span>
            </Badge>
          </div>

          {nodeDatum.dtmfKey && (
            <div className="text-xs text-gray-500 mb-1">
              DTMF Key: <span className="font-mono bg-gray-800 px-1 rounded">{nodeDatum.dtmfKey}</span>
            </div>
          )}

          {nodeDatum.audioFile && (nodeDatum.action === "Playback" || nodeDatum.action === "PlayWithDTMF") && (
            <div className="text-xs text-gray-500 mb-1">
              Audio:{" "}
              <span className="font-mono bg-gray-800 px-1 rounded truncate max-w-[100px] inline-block align-bottom">
                {nodeDatum.audioFile}
              </span>
            </div>
          )}

          {nodeDatum.insertDatabase && (
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Database className="h-3 w-3 text-purple-500" />
              <span>Database Insert</span>
            </div>
          )}

          <div className="flex gap-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation()
                openEditModal(nodeDatum)
              }}
            >
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedNode(nodeDatum)
                setIsAddModalOpen(true)
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>
      </foreignObject>
    )
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(ivrTree, null, 2))
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "IVR tree JSON has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  // Audio file options
  const audioFileOptions = [
    { value: "welcome", label: "Welcome Message" },
    { value: "main-menu", label: "Main Menu Options" },
    { value: "invalid-input", label: "Invalid Input Message" },
    { value: "goodbye", label: "Goodbye Message" },
    { value: "hold-music", label: "Hold Music" },
    { value: "transfer-message", label: "Transfer Message" },
    { value: "voicemail", label: "Voicemail Greeting" },
    { value: "hours", label: "Business Hours" },
    { value: "support-menu", label: "Support Menu" },
    { value: "sales-menu", label: "Sales Menu" },
    { value: "billing-menu", label: "Billing Menu" },
    { value: "tech-support", label: "Technical Support" },
  ]

  // Convert the IVR tree to D3 format
  const d3Tree = convertToD3Format(ivrTree)

  return (
    <Card className="p-4 shadow-sm border bg-background">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">IVR Tree Builder</h2>
        <Button onClick={copyToClipboard} variant={copied ? "outline" : "default"} className="flex items-center gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Export JSON"}
        </Button>
      </div>

      <div className="bg-slate-900/20 border rounded-lg overflow-hidden relative">
        <div id="treeWrapper" className="w-full h-[40em]">
          <Tree
            data={d3Tree}
            orientation="vertical"
            translate={translate}
            zoom={zoom}
            onUpdate={(state) => {
              setTranslate(state.translate)
              setZoom(state.zoom)
            }}
            renderCustomNodeElement={renderCustomNode}
            pathFunc="elbow"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 240, y: 160 }}
            pathClassFunc={() => "stroke-gray-600 stroke-[1.5px]"}
            draggable={true}
            zoomable={true}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background/80 p-2 rounded-lg border shadow-sm">
          <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView} title="Reset View">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Node Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Node to "{selectedNode?.name}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="nodeName" className="text-sm font-medium">
                Node Name
              </label>
              <Input
                id="nodeName"
                placeholder="Enter node name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="action" className="text-sm font-medium">
                Action Type
              </label>
              <Select value={action} onValueChange={(value: any) => setAction(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playback">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-600" />
                      Playback
                    </div>
                  </SelectItem>
                  <SelectItem value="PlayWithDTMF">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-blue-600" />
                      PlayWithDTMF
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action === "PlayWithDTMF" && (
              <div className="space-y-2">
                <label htmlFor="dtmfKey" className="text-sm font-medium">
                  DTMF Key
                </label>
                <Input
                  id="dtmfKey"
                  placeholder="e.g., 1, 2, #, *"
                  value={dtmfKey}
                  onChange={(e) => setDtmfKey(e.target.value)}
                  maxLength={1}
                />
              </div>
            )}

            {(action === "Playback" || action === "PlayWithDTMF") && (
              <div className="space-y-2">
                <label htmlFor="audioFile" className="text-sm font-medium">
                  Audio File
                </label>
                <Select value={audioFile} onValueChange={setAudioFile}>
                  <SelectTrigger id="audioFile">
                    <SelectValue placeholder="Select an audio file" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectLabel>System Audio</SelectLabel>
                      {audioFileOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="insertDatabase"
                checked={insertDatabase}
                onCheckedChange={(checked) => setInsertDatabase(checked as boolean)}
              />
              <label
                htmlFor="insertDatabase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Database className="h-4 w-4 text-purple-500" />
                Insert to Database
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNode}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Node: "{editingNode?.name}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editNodeName" className="text-sm font-medium">
                Node Name
              </label>
              <Input
                id="editNodeName"
                placeholder="Enter node name"
                value={editNodeName}
                onChange={(e) => setEditNodeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="editAction" className="text-sm font-medium">
                Action Type
              </label>
              <Select value={editAction} onValueChange={(value: any) => setEditAction(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playback">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-600" />
                      Playback
                    </div>
                  </SelectItem>
                  <SelectItem value="PlayWithDTMF">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-blue-600" />
                      PlayWithDTMF
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editAction === "PlayWithDTMF" && (
              <div className="space-y-2">
                <label htmlFor="editDtmfKey" className="text-sm font-medium">
                  DTMF Key
                </label>
                <Input
                  id="editDtmfKey"
                  placeholder="e.g., 1, 2, #, *"
                  value={editDtmfKey}
                  onChange={(e) => setEditDtmfKey(e.target.value)}
                  maxLength={1}
                />
              </div>
            )}

            {(editAction === "Playback" || editAction === "PlayWithDTMF") && (
              <div className="space-y-2">
                <label htmlFor="editAudioFile" className="text-sm font-medium">
                  Audio File
                </label>
                <Select value={editAudioFile} onValueChange={setEditAudioFile}>
                  <SelectTrigger id="editAudioFile">
                    <SelectValue placeholder="Select an audio file" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectLabel>System Audio</SelectLabel>
                      {audioFileOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editInsertDatabase"
                checked={editInsertDatabase}
                onCheckedChange={(checked) => setEditInsertDatabase(checked as boolean)}
              />
              <label
                htmlFor="editInsertDatabase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
              >
                <Database className="h-4 w-4 text-purple-500" />
                Insert to Database
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNode}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </Card>
  )
}

