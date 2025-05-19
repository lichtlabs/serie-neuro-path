"use client";

import { useChat } from "@ai-sdk/react";
import { Controls, Edge, Node, ReactFlow } from "@xyflow/react";
import { Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UIMessage } from "ai";
import { Loader2, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

import { RoadmapFlowRenderer } from "./roadmap-flow";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function isNeedToGenerateRoadmap(messages: UIMessage[]) {
    // find the last ai message
    const lastAiMessage = messages.findLast(
        (message) => message.role === "assistant",
    );
    if (lastAiMessage) {
        return lastAiMessage.content.includes(
            "I will generate the learning path for you!",
        );
    }
    return false;
}

export default function Chat() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
    const [regeneratingNodeIds, setRegeneratingNodeIds] = useState<string[]>(
        [],
    );

    const { status, messages, input, handleInputChange, handleSubmit } =
        useChat({
            body: {
                aiProvider: "openai",
            },
        });

    useEffect(() => {
        if (status === "ready" && messages.length > 0) {
            if (isNeedToGenerateRoadmap(messages)) {
                setIsGeneratingRoadmap(true);
                fetch("/api/gen-roadmap", {
                    method: "POST",
                    body: JSON.stringify({ messages }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                        setNodes(data.nodes);
                        setEdges(data.edges);
                        setIsGeneratingRoadmap(false);
                    });
            }
        }
    }, [status, messages]);

    const handleRegenerateNode = async (nodeId: string) => {
        setRegeneratingNodeIds((ids) => [...ids, nodeId]);
        // Find the node and send its context (all other nodes) to the backend
        const nodeToRegenerate = nodes.find((n) => n.id === nodeId);
        const otherNodes = nodes.filter((n) => n.id !== nodeId);
        try {
            const res = await fetch("/api/gen-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    regenerateNodeId: nodeId,
                    previousNodes: otherNodes,
                    node: nodeToRegenerate,
                    messages,
                }),
            });
            const data = await res.json();
            if (data.node) {
                setNodes((prev) =>
                    prev.map((n) => (n.id === nodeId ? data.node : n)),
                );
            }
        } catch (e) {
            // Optionally handle error
        } finally {
            setRegeneratingNodeIds((ids) => ids.filter((id) => id !== nodeId));
        }
    };

    const notReady = status !== "ready";

    return (
        <SidebarProvider
            style={{
                // @ts-ignore
                "--sidebar-width": "28rem",
                "--sidebar-width-mobile": "28rem",
            }}
        >
            <Sidebar>
                <SidebarHeader className="flex items-center justify-between">
                    <SidebarMenuButton>
                        <Waypoints />
                        <span className="font-semibold">Serie Neuro Path</span>
                    </SidebarMenuButton>
                </SidebarHeader>
                <SidebarContent>
                    <div
                        className={cn(
                            "w-full flex flex-col flex-1 px-8 gap-4 relative",
                            messages.length === 0 && "justify-center",
                        )}
                    >
                        <div
                            className={cn(
                                "flex flex-col gap-6",
                                messages.length > 0 && "flex-1",
                            )}
                        >
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "whitespace-pre-wrap",
                                        message.role === "user" && "text-right",
                                    )}
                                >
                                    {notReady && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    {message.role === "user" ? "" : "AI: "}
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case "text":
                                                return (
                                                    <div
                                                        key={`${message.id}-${i}`}
                                                    >
                                                        {part.text}
                                                    </div>
                                                );
                                        }
                                    })}
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className={cn(
                                "w-full",
                                messages.length > 0 && "mt-auto mb-8",
                            )}
                        >
                            <Textarea
                                value={input}
                                placeholder="Say something..."
                                onChange={handleInputChange}
                            />
                            <Button type="submit" disabled={notReady}>
                                Send
                            </Button>
                        </form>
                    </div>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col flex-1">
                    <header className="flex items-center justify-between h-11 border-b px-2">
                        <SidebarTrigger />
                    </header>
                    <main className="flex flex-1">
                        <RoadmapFlowRenderer
                            nodes={nodes}
                            edges={edges}
                            isGeneratingRoadmap={isGeneratingRoadmap}
                            regeneratingNodeIds={regeneratingNodeIds}
                            onRegenerate={handleRegenerateNode}
                        />
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
