"use client";

import { useChat } from "@ai-sdk/react";
import { Controls, Edge, ReactFlow } from "@xyflow/react";
import { Background } from "@xyflow/react";
import { Waypoints } from "lucide-react";
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

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function Chat() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const { status, messages, input, handleInputChange, handleSubmit } =
        useChat({
            body: {
                aiProvider: "openai",
            },
        });

    const notReady = status !== "ready";

    useEffect(() => {
        if (status === "ready") {
            console.log(messages);
            // setNodes(data.nodes);
            // setEdges(data.edges);
        }
    }, [status, messages]);

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
                                    {message.role === "user" ? "" : "AI: "}
                                    {notReady && "Generating..."}
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
                        <div className="w-full h-full text-black">
                            {/* <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background />
                                <Controls />
                            </ReactFlow> */}
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
