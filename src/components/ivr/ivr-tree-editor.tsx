
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { IVRTre } from "@/components/ivr/ivr-tree"
import { IVRNodeEditor } from "@/components/ivr/ivr-node-editor"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Save, Download, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type IVRNodeType =
  | "AgentTransfer"
  | "PlayAudio"
  | "PlayAudioBackground"
  | "PlaySoundWithDTMFAccept"
  | "HangUp"
  | "Transfer"

export interface IVRNode {
  id: string
  type: IVRNodeType
  label: string
  parentId: string | null
  children: string[]
  config: Record<string, any>
}

// Initial IVR tree with a root node
const initialIVRTree: Record<string, IVRNode> = {
  root: {
    id: "root",
    type: "PlayAudio",
    label: "Welcome Message",
    parentId: null,
    children: [],
    config: {
      audioFile: null,
      audioFileName: "welcome_message",
    },
  },
}

// Sample IVR trees for the dropdown
const sampleIVRTrees = [
  { id: "ivr1", name: "Main IVR" },
  { id: "ivr2", name: "Support IVR" },
  { id: "ivr3", name: "Sales IVR" },
]

export function IVRTreeEditor() {
  const { toast } = useToast()
  const [ivrTree, setIvrTree] = useState<Record<string, IVRNode>>(initialIVRTree)
  const [selectedNodeId, setSelectedNodeId] = useState<string>("root")
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [ivrTrees, setIvrTrees] = useState(sampleIVRTrees)
  const [selectedIvrId, setSelectedIvrId] = useState<string>("")
  const [isCreatingTree, setIsCreatingTree] = useState(false)
  const [newTreeName, setNewTreeName] = useState("")

  // Load IVR trees on component mount
  useEffect(() => {
    // In a real implementation, this would fetch from your API
    // For now, we'll use the sample data
    setIvrTrees(sampleIVRTrees)
  }, [])

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setIsAddingNode(false)
  }

  const handleAddNode = () => {
    setIsAddingNode(true)
  }


  const handleSaveNode = (node: IVRNode, isNew = false) => {
    if (!isNew && node.parentId && wouldCreateCircularReference(node.id, node.parentId)) {
      toast({
        title: "Cannot Save Node",
        description: "This would create a circular reference in the IVR tree.",
        variant: "destructive",
      })
      return
    }

    setIvrTree((prev) => {
      const newTree = { ...prev }

      if (isNew && node.parentId) {
        // 💚 Create the new node
        newTree[node.id] = {
          ...node,
          children: [], // new node always starts with empty children!
        }

        // 💚 Add it to parent's children
        const parent = newTree[node.parentId]
        if (parent) {
          newTree[parent.id] = {
            ...parent,
            children: [...(parent.children || []), node.id],
          }
        }
      } else {
        // 💛 Update existing node while keeping its current children!
        const existing = newTree[node.id]
        console.log(node)
        newTree[node.id] = {
          ...node,
          children: existing?.children || [],
        }
      }

      return newTree
    })

    setIsAddingNode(false)
    setSelectedNodeId(node.id)

    toast({
      title: isNew ? "Node Added" : "Node Updated",
      description: `The IVR node "${node.label}" has been ${isNew ? "added" : "updated"} successfully.`,
    })
  }
  // Helper function to check if adding a parent would create a circular reference
  const wouldCreateCircularReference = (nodeId: string, parentId: string): boolean => {
    // If we're trying to make a node its own parent, that's a circular reference
    if (nodeId === parentId) return true

    // Check if the proposed parent is actually a child of this node (at any depth)
    const isChildOfNode = (currentNodeId: string, targetParentId: string): boolean => {
      const currentNode = ivrTree[currentNodeId]
      if (!currentNode) return false

      // Check direct children
      if (currentNode.children.includes(targetParentId)) return true

      // Check children's children recursively
      for (const childId of currentNode.children) {
        if (isChildOfNode(childId, targetParentId)) return true
      }

      return false
    }

    return isChildOfNode(nodeId, parentId)
  }

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === "root") {
      toast({
        title: "Cannot Delete Root Node",
        description: "The root node cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setIvrTree((prev) => {
      const newTree = { ...prev }
      const nodeToDelete = newTree[nodeId]

      // Remove the node from its parent's children
      if (nodeToDelete.parentId) {
        const parent = newTree[nodeToDelete.parentId]
        if (parent) {
          newTree[nodeToDelete.parentId] = {
            ...parent,
            children: parent.children.filter((id) => id !== nodeId),
          }
        }
      }

      // Recursively delete all children
      const deleteChildren = (childrenIds: string[]) => {
        childrenIds.forEach((childId) => {
          const child = newTree[childId]
          if (child) {
            deleteChildren(child.children)
            delete newTree[childId]
          }
        })
      }

      deleteChildren(nodeToDelete.children)

      // Delete the node itself
      delete newTree[nodeId]

      return newTree
    })

    setSelectedNodeId("root")

    toast({
      title: "Node Deleted",
      description: "The IVR node and all its children have been deleted.",
    })
  }

  const handleSaveIVR = () => {
    // In a real application, this would save to a database
    console.log("Saving IVR configuration:", ivrTree)

    toast({
      title: "IVR Configuration Saved",
      description: "Your IVR flow has been saved successfully.",
    })
  }

  const handleCreateTree = () => {
    if (!newTreeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new IVR tree.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would create a new tree in your database
    const newTreeId = `ivr${ivrTrees.length + 1}`
    const newTree = {
      id: newTreeId,
      name: newTreeName,
    }

    setIvrTrees([...ivrTrees, newTree])
    setSelectedIvrId(newTreeId)
    setIvrTree(initialIVRTree) // Reset to a fresh tree
    setIsCreatingTree(false)
    setNewTreeName("")

    toast({
      title: "IVR Tree Created",
      description: `New IVR tree "${newTreeName}" has been created successfully.`,
    })
  }

  const handleSelectIvrTree = (id: string) => {
    setSelectedIvrId(id)
    // In a real implementation, this would fetch the tree data from your API
    // For now, we'll just reset to the initial tree
    setIvrTree(initialIVRTree)
    setSelectedNodeId("root")
  }

  const handleExportTree = () => {
    const dataStr = JSON.stringify(ivrTree, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `ivr-tree-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportTree = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedTree = JSON.parse(e.target?.result as string)
        setIvrTree(importedTree)
        setSelectedNodeId("root")

        toast({
          title: "IVR Tree Imported",
          description: "The IVR tree has been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import the IVR tree. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const selectedNode = selectedNodeId ? ivrTree[selectedNodeId] : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <Label htmlFor="ivr-select" className="mb-2 block">
              Select IVR Tree
            </Label>
            <Select value={selectedIvrId} onValueChange={handleSelectIvrTree}>
              <SelectTrigger id="ivr-select">
                <SelectValue placeholder="Select an IVR tree" />
              </SelectTrigger>
              <SelectContent>
                {ivrTrees.map((tree) => (
                  <SelectItem key={tree.id} value={tree.id}>
                    {tree.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreatingTree} onOpenChange={setIsCreatingTree}>
            <DialogTrigger asChild>
              <Button variant="outline">Create New IVR Tree</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New IVR Tree</DialogTitle>
                <DialogDescription>Enter a name for your new IVR tree.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="tree-name" className="mb-2 block">
                  IVR Tree Name
                </Label>
                <Input
                  id="tree-name"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  placeholder="Enter IVR tree name"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingTree(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTree}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleAddNode} disabled={isAddingNode}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Node
          </Button>
          <Button onClick={handleSaveIVR} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save IVR
          </Button>
          <Button onClick={handleExportTree} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <input id="import-file" type="file" accept=".json" onChange={handleImportTree} className="hidden" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-lg p-4 bg-card min-h-[600px] overflow-hidden">
          <IVRTree tree={ivrTree} selectedNodeId={selectedNodeId} onNodeSelect={handleNodeSelect} />
        </div>

        <div className="border rounded-lg p-4 bg-card">
          {isAddingNode ? (
            <IVRNodeEditor
              parentNodeId={selectedNodeId}
              onSave={handleSaveNode}
              onCancel={() => setIsAddingNode(false)}
              isNew={true}
            />
          ) : selectedNode ? (
            <IVRNodeEditor node={selectedNode} onSave={handleSaveNode} onDelete={handleDeleteNode} />
          ) : (
            <Alert>
              <AlertDescription>
                Select a node from the tree to edit its properties, or click "Add Node" to create a new one.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

