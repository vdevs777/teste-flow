"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node,
  Connection,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    data: { label: "Node Inicial" },
    position: { x: 250, y: 5 },
  },
];

export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}

function FlowEditor() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState(2);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const addNode = () => {
    const newNode: Node = {
      id: nodeId.toString(),
      type: "default",
      data: { label: `Node ${nodeId}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((prev) => [...prev, newNode]);
    setNodeId(nodeId + 1);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) =>
      prev.filter((edge) => edge.source !== id && edge.target !== id)
    );
    setSelectedNodeId(null);
  };

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
    setEditingNodeId(null);
  };

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNodeId(node.id);
  };

  useEffect(() => {
    if (selectedNodeId && listRef.current) {
      const nodeElement = document.getElementById(
        `node-item-${selectedNodeId}`
      );
      nodeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedNodeId]);

  return (
    <div className="w-full h-screen flex">
      <aside className="w-60 p-4 bg-gray-100 border-r shadow-md">
        <h2 className="text-lg font-semibold mb-2">Nós Criados</h2>
        <ScrollArea className="h-[860px]">
          <ul ref={listRef} className="space-y-2">
            {nodes.map((node) => (
              <li
                key={node.id}
                id={`node-item-${node.id}`}
                className={`flex justify-between items-center p-2 bg-white rounded shadow cursor-pointer transition-all ${
                  selectedNodeId === node.id ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => setSelectedNodeId(node.id)}
              >
                {editingNodeId === node.id ? (
                  <input
                    type="text"
                    // @ts-ignore
                    defaultValue={node.data.label}
                    autoFocus
                    className="border p-1 rounded w-full"
                    onBlur={(e) => updateNodeLabel(node.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateNodeLabel(
                          node.id,
                          (e.target as HTMLInputElement).value
                        );
                      }
                    }}
                  />
                ) : (
                  // @ts-ignore
                  <span>{node.data.label}</span>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNodeId(node.id);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(node.id);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    X
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <Button className="mt-4 w-full" onClick={addNode}>
          Adicionar Nó
        </Button>
      </aside>

      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) =>
            setNodes((nds) => applyNodeChanges(changes, nds))
          }
          onEdgesChange={(changes) =>
            setEdges((eds) => applyEdgeChanges(changes, eds))
          }
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
