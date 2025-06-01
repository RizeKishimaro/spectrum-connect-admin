"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react"; // Added useEffect
import Tree from 'react-d3-tree';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";

const NODE_TYPES = ["Playback", "WaitForDTMF", "Transfer"];

const getNextNodeId = (currentNodes) => {
  if (!currentNodes || currentNodes.length === 0) return 0;
  return Math.max(...currentNodes.map(n => n.id)) + 1;
};

const createNodeData = (id, parentId = null) => ({
  id: id,
  type: "Playback",
  params: "",
  dtmfOptions: {},
  parentId,
});

export default function IVRTreeBuilder() {
  const [nodes, setNodes] = useState(() => [createNodeData(0, null)]);
  // State to signal which parent node should be expanded after adding a child
  const [justAddedToParentId, setJustAddedToParentId] = useState(null);

  const updateNode = useCallback((id, field, value) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === id ? { ...node, [field]: value } : node
      )
    );
  }, []);

  const addChild = useCallback((parentId) => {
    setNodes(prev => {
      const newId = getNextNodeId(prev);
      const newNode = createNodeData(newId, parentId);
      return [...prev, newNode];
    });
    // Set the parent ID to signal it should be expanded
    setJustAddedToParentId(parentId);
  }, []);

  const removeNode = useCallback((idToRemove) => {
    setNodes(prev => {
      const nodesToRemove = new Set();
      const queue = [idToRemove];
      while (queue.length > 0) {
        const currentId = queue.shift();
        nodesToRemove.add(currentId);
        prev.forEach(node => {
          if (node.parentId === currentId) {
            queue.push(node.id);
          }
        });
      }
      return prev.filter(n => !nodesToRemove.has(n.id));
    });
  }, []);

  const handleDTMFChange = useCallback((id, dtmfString) => {
    try {
      const obj = Object.fromEntries(
        dtmfString
          .split(",")
          .map(s => s.trim())
          .filter(s => s.includes(':'))
          .map(s => {
            const parts = s.split(":");
            const key = parts[0].trim();
            const value = Number(parts[1].trim());
            if (key && !isNaN(value)) {
              return [key, value];
            }
            return null;
          })
          .filter(pair => pair !== null)
      );
      updateNode(id, "dtmfOptions", obj);
    } catch (error) {
      console.error("Error parsing DTMF string:", error);
    }
  }, [updateNode]);

  const treeData = useMemo(() => {
    const buildTree = (parentId = null) => {
      return nodes
        .filter(node => node.parentId === parentId)
        .map(node => {
          const children = buildTree(node.id);
          const nodeSetup = {
            ...node,
            name: `Node #${node.id}`,
            attributes: { Type: node.type },
            children: children,
          };

          // If this node is the parent that just had a child added,
          // and it actually has children, provide the `_collapsed: false` hint.
          // `react-d3-tree` might use this to initialize `__rd3t.collapsed = false`.
          if (children.length > 0 && node.id === justAddedToParentId) {
            nodeSetup._collapsed = false;
          }
          return nodeSetup;
        });
    };
    return buildTree(null); // Returns an array of root nodes
  }, [nodes, justAddedToParentId]); // Recompute if nodes or the hint changes

  // useEffect to reset `justAddedToParentId` after the treeData has been computed with the hint.
  // This runs after the render cycle.
  useEffect(() => {
    if (justAddedToParentId !== null) {
      setJustAddedToParentId(null);
    }
  }, [justAddedToParentId]);


  const foreignObjectProps = { width: 330, height: 320, x: 20, y: -15 };

  const renderForeignObjectNode = useCallback(({ nodeDatum, toggleNode }) => (
    <g>
      <circle
        r={12}
        fill={nodeDatum.children && nodeDatum.children.length > 0 ? "royalblue" : "#ccc"}
        onClick={toggleNode}
        cursor="pointer"
      />
      <foreignObject
        width={foreignObjectProps.width}
        height={foreignObjectProps.height}
        x={foreignObjectProps.x}
        y={foreignObjectProps.y - (foreignObjectProps.height / 2)}
      >
        <div style={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.5rem",
          backgroundColor: "white",
          padding: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
          fontSize: "0.875rem",
          width: "100%",
          minHeight: `${foreignObjectProps.height - 30}px`,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
            <strong onClick={toggleNode} style={{ cursor: "pointer", fontSize: "1rem", color: "#1e293b" }}>
              {nodeDatum.name}
              {/* Check __rd3t.collapsed for the icon, as this is react-d3-tree's internal truth after processing */}
              {nodeDatum.children && nodeDatum.children.length > 0 ? (nodeDatum.__rd3t?.collapsed ? ' (+)' : ' (-)') : ''}
            </strong>
            {(nodes.length > 1 || nodeDatum.parentId !== null) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNode(nodeDatum.id)}
                className="text-red-500 hover:text-red-700"
                style={{ padding: "0.25rem" }}
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>

          <Select
            value={nodeDatum.type}
            onValueChange={val => updateNode(nodeDatum.id, "type", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              {NODE_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Parameters (e.g., welcome.wav, 1001)"
            value={nodeDatum.params}
            onChange={e => updateNode(nodeDatum.id, "params", e.target.value)}
            className="w-full"
          />

          {nodeDatum.type === "WaitForDTMF" && (
            <Input
              placeholder="DTMF:NextNodeID (e.g., 1:2,2:3)"
              value={Object.entries(nodeDatum.dtmfOptions || {})
                .map(([k, v]) => `${k}:${v}`)
                .join(",")}
              onChange={e => handleDTMFChange(nodeDatum.id, e.target.value)}
              className="w-full"
              title="Format: digit:nextNodeId, anotherDigit:anotherNodeId. Example: 1:2 (if 1 pressed, go to node #2)"
            />
          )}
          <Button onClick={() => addChild(nodeDatum.id)} className="w-full gap-2 mt-auto">
            <PlusCircle size={16} /> Add Child Node
          </Button>
        </div>
      </foreignObject>
    </g>
  ), [updateNode, removeNode, addChild, handleDTMFChange, foreignObjectProps, nodes.length]); // nodes.length for delete button logic

  const handleAddFirstNode = () => {
    if (nodes.length === 0) {
      setNodes([createNodeData(0, null)]);
    }
  };

  const displayData = treeData.length > 0 ? treeData[0] : null;

  if (nodes.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-6 text-center">📞 IVR Tree Builder</h1>
        <p className="mb-4 text-slate-600">No IVR flow defined. Get started by creating an initial node.</p>
        <Button onClick={handleAddFirstNode} className="gap-2">
          <PlusCircle size={18} /> Create Initial Node
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-screen flex flex-col bg-slate-50">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-700">📞 IVR Tree Builder</h1>
      <div style={{ width: '100%', flexGrow: 1, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
        {displayData ? (
          <Tree
            data={displayData}
            renderCustomNodeElement={(rd3tProps) => renderForeignObjectNode({ ...rd3tProps })}
            orientation="vertical"
            pathFunc="elbow"
            collapsible={true}
            initialDepth={0} // You might want to increase this if you want more levels expanded by default generally
            translate={{ x: (typeof window !== "undefined" ? window.innerWidth / 2 - foreignObjectProps.width / 2 : 300), y: 100 }}
            separation={{ siblings: 1.2, nonSiblings: 1.8 }}
            nodeSize={{ x: foreignObjectProps.width + 80, y: foreignObjectProps.height + 100 }}
            depthFactor={foreignObjectProps.height + 50}
            zoomable={true}
            scaleExtent={{ min: 0.2, max: 1.5 }}
            dimensions={typeof window !== "undefined" ? { width: window.innerWidth - 50, height: window.innerHeight - 150 } : undefined}
            centeringTransitionDuration={300}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Loading tree or no root node to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
