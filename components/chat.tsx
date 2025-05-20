"use client";

import { useChat } from "@ai-sdk/react";
import { Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UIMessage } from "ai";
import { Bot as BotIcon, Mic, Volume, Waypoints } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import ChatBubble from "./chat-bubble";
import ChatLoader from "./chat-loader";
import { RoadmapFlowRenderer } from "./roadmap-flow";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

// For development debugging
const isDev = process.env.NODE_ENV !== "production";

function isNeedToGenerateRoadmap(messages: UIMessage[]) {
    // find the last ai message
    const lastAiMessage = messages.findLast(
        (message) => message.role === "assistant",
    );
    if (lastAiMessage) {
        // Check for the exact phrase that indicates a roadmap should be generated
        const content = lastAiMessage.content;

        // The actual format in the signPrompt is:
        // "sign: I will generate the learning path for you!"
        const exactSignFormat =
            "sign: I will generate the learning path for you!";

        console.log("Checking roadmap generation phrase in:", {
            contentSnippet: content.substring(0, 100) + "...",
            exactPhraseFound: content.includes(
                "I will generate the learning path for you!",
            ),
            exactSignFormatFound: content.includes(exactSignFormat),
            lowercaseFound: content
                .toLowerCase()
                .includes("i will generate the learning path for you!"),
        });

        // Check for different variants of the phrase
        return (
            content.includes("I will generate the learning path for you!") ||
            content
                .toLowerCase()
                .includes("i will generate the learning path for you!") ||
            content.includes(exactSignFormat) ||
            content.includes("I will generate the learning path for you!")
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
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const lastProcessedRoadmapMessageId = useRef<string | null>(null);

    const { status, messages, input, handleInputChange, handleSubmit } =
        useChat({
            body: {
                aiProvider: "openai",
            },
        });

    // Memoize the submit handler to prevent unnecessary re-renders
    const memoizedSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            handleSubmit(e);
        },
        [handleSubmit],
    );

    // UseRef to track if we need to generate roadmap without causing re-renders
    const shouldGenerateRoadmapRef = useRef(false);
    // Add a state variable to trigger the roadmap generation effect
    const [triggerRoadmapGen, setTriggerRoadmapGen] = useState(0);

    // First effect to check if we need to generate a roadmap and set the ref
    useEffect(() => {
        // Only check when ready and messages exist
        if (status === "ready" && messages.length > 0) {
            // Find the last assistant message
            const lastAiMessage = messages.findLast(
                (message) => message.role === "assistant",
            );

            if (lastAiMessage) {
                // Get message content and check for roadmap trigger phrases
                const content = lastAiMessage.content.toLowerCase();
                const shouldGenerate = isNeedToGenerateRoadmap(messages);

                // Log for debugging
                console.log("Last AI message:", {
                    content: content.substring(0, 100) + "...",
                    shouldGenerate,
                    id: lastAiMessage.id,
                    lastProcessedId: lastProcessedRoadmapMessageId.current,
                });

                // Only trigger if not already processed this message
                if (
                    shouldGenerate &&
                    lastProcessedRoadmapMessageId.current !== lastAiMessage.id
                ) {
                    console.log("Triggering roadmap generation!");
                    shouldGenerateRoadmapRef.current = true;
                    lastProcessedRoadmapMessageId.current = lastAiMessage.id;
                    // Increment the trigger to cause the second effect to run
                    setTriggerRoadmapGen((prev) => prev + 1);
                }
            }
        }
    }, [status, messages]);

    // Second effect to handle the actual API call, separated to break the render cycle
    useEffect(() => {
        // Only run if the ref is set to true
        if (shouldGenerateRoadmapRef.current) {
            console.log("Attempting to generate roadmap...");
            shouldGenerateRoadmapRef.current = false;
            setIsGeneratingRoadmap(true);

            fetch("/api/gen-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    requireDescription: true,
                }),
            })
                .then((res) => {
                    console.log("Roadmap API response status:", res.status);
                    return res.json();
                })
                .then((data) => {
                    console.log("Roadmap data received:", data);
                    setNodes(data.nodes);
                    setEdges(data.edges);
                    setIsGeneratingRoadmap(false);
                })
                .catch((err) => {
                    // Error handling
                    console.error("Roadmap generation error:", err);
                    setIsGeneratingRoadmap(false);
                });
        }
    }, [triggerRoadmapGen, messages]);

    useEffect(() => {
        return () => {
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
                speechSynthesisRef.current = null;
            }
        };
    }, []);

    function handleTextareaKeyDown(
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            memoizedSubmit(e as any);
        }
    }

    function handleTranscribeClick() {
        if (isTranscribing) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsTranscribing(false);
            return;
        }
        if (
            typeof window !== "undefined" &&
            (window as any).webkitSpeechRecognition
        ) {
            var SpeechRecognition = (window as any).webkitSpeechRecognition;
            var recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onresult = function (event: any) {
                var transcript = event.results[0][0].transcript;
                handleInputChange({
                    target: {
                        value: input ? input + " " + transcript : transcript,
                    },
                } as any);
                setIsTranscribing(false);
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            };
            recognition.onerror = () => {
                setIsTranscribing(false);
            };
            recognition.onend = () => {
                setIsTranscribing(false);
            };
            recognitionRef.current = recognition;
            setIsTranscribing(true);
            recognition.start();
        } else {
            alert("Speech recognition is not supported in this browser.");
        }
    }

    function getLatestAssistantText() {
        for (var i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "assistant") {
                var parts = messages[i].parts.filter(
                    (part) => part.type === "text",
                );
                if (parts.length > 0) {
                    return parts.map((part) => part.text).join(" ");
                }
            }
        }
        return "";
    }

    function handleSpeakClick() {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const text = getLatestAssistantText();
        if (text) {
            const utterance = new window.SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setIsSpeaking(false);
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
            };
            speechSynthesisRef.current = utterance;
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    }

    const handleRegenerateNode = useCallback(
        async (nodeId: string) => {
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
                setRegeneratingNodeIds((ids) =>
                    ids.filter((id) => id !== nodeId),
                );
            }
        },
        [nodes, messages],
    );

    function handlePromptClick(prompt: string) {
        handleInputChange({
            target: { value: input ? input + " " + prompt : prompt },
        } as any);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }

    const inputDisabled = status === "submitted" || status === "streaming";

    // Debounced auto-scroll: only scroll when a new message is added
    useEffect(() => {
        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        if (lastMessageIdRef.current !== lastMessage.id) {
            lastMessageIdRef.current = lastMessage.id;
            // Debounce scroll to avoid jank during streaming
            const timeout = setTimeout(() => {
                if (chatScrollRef.current) {
                    chatScrollRef.current.scrollTop =
                        chatScrollRef.current.scrollHeight;
                }
            }, 200); // 200ms debounce for smoothness
            return () => clearTimeout(timeout);
        }
    }, [messages]);

    // Group messages by sender for avatar logic
    let grouped: { message: UIMessage; showAvatar: boolean }[] = [];
    for (let i = 0; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];
        grouped.push({
            message: curr,
            showAvatar: !prev || prev.role !== curr.role,
        });
    }

    return (
        <SidebarProvider
            style={{
                // @ts-ignore
                "--sidebar-width": "34vw",
                "--sidebar-width-mobile": "34vw",
            }}
        >
            <Sidebar>
                <SidebarHeader className="flex items-center justify-between">
                    <SidebarMenuButton>
                        <Waypoints />
                        <span className="font-semibold">Serie Neuro Path</span>
                    </SidebarMenuButton>
                    {/* Debug button to manually trigger roadmap generation */}
                    {isDev && messages.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                console.log(
                                    "Manual roadmap generation triggered",
                                );
                                shouldGenerateRoadmapRef.current = true;
                                setTriggerRoadmapGen((prev) => prev + 1);
                            }}
                        >
                            Debug: Generate Roadmap
                        </Button>
                    )}
                </SidebarHeader>
                <SidebarContent className="px-2 pb-2">
                    <div
                        className={cn(
                            "w-full flex flex-col flex-1 items-center px-0 sm:px-8 gap-4 relative bg-background rounded-lg border border-muted shadow-inner overflow-y-auto",
                            messages.length === 0 && "justify-center",
                        )}
                        style={{ minHeight: 0 }}
                    >
                        <div
                            ref={chatScrollRef}
                            className={cn(
                                "flex flex-col gap-1 py-6 overflow-y-auto flex-1 w-full max-w-2xl mx-auto transition-all",
                                messages.length > 0 && "flex-1",
                            )}
                            style={{
                                minHeight: 0,
                                maxHeight: "calc(100vh - 220px)",
                                scrollBehavior: "smooth",
                            }}
                        >
                            {grouped.map(({ message, showAvatar }) => {
                                const isUser = message.role === "user";
                                const timestamp = message.createdAt
                                    ? new Date(message.createdAt)
                                    : new Date();
                                return (
                                    <ChatBubble
                                        key={message.id}
                                        message={message}
                                        showAvatar={showAvatar}
                                        isUser={isUser}
                                        timestamp={timestamp}
                                    />
                                );
                            })}
                            {status === "submitted" && (
                                <ChatLoader isUser={true} />
                            )}
                            {status === "streaming" && (
                                <ChatLoader isUser={false} />
                            )}
                            {status === "error" && (
                                <div className="flex w-full items-center mt-2 mb-2 justify-start">
                                    <div className="flex items-center gap-2 text-destructive text-xs px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 shadow-sm">
                                        <BotIcon className="w-4 h-4 text-destructive" />
                                        <span>
                                            ⚠️ Something went wrong. Please try
                                            again.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form
                            onSubmit={memoizedSubmit}
                            className={cn(
                                "w-full flex gap-2 items-end pt-4 pb-2 px-2 sticky bottom-0 z-10 mb-6 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-muted/40",
                                messages.length > 0 && "mt-auto mb-8",
                            )}
                            style={{ maxWidth: "48rem", margin: "0 auto" }}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={
                                            isTranscribing
                                                ? "secondary"
                                                : "outline"
                                        }
                                        onClick={handleTranscribeClick}
                                        aria-label={
                                            isTranscribing
                                                ? "Stop transcribing"
                                                : "Transcribe audio"
                                        }
                                        className="rounded-full"
                                        disabled={inputDisabled}
                                    >
                                        <Mic
                                            className={
                                                isTranscribing
                                                    ? "animate-pulse"
                                                    : ""
                                            }
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isTranscribing
                                        ? "Stop transcribing"
                                        : "Transcribe audio"}
                                </TooltipContent>
                            </Tooltip>
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                placeholder="Say something..."
                                onChange={handleInputChange}
                                onKeyDown={handleTextareaKeyDown}
                                className="flex-1 min-h-[40px] max-h-40 resize-y"
                                disabled={inputDisabled}
                            />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={
                                            isSpeaking ? "secondary" : "outline"
                                        }
                                        onClick={handleSpeakClick}
                                        aria-label={
                                            isSpeaking
                                                ? "Stop speaking"
                                                : "Speak latest response"
                                        }
                                        className="rounded-full"
                                        disabled={inputDisabled}
                                    >
                                        <Volume
                                            className={
                                                isSpeaking
                                                    ? "animate-pulse"
                                                    : ""
                                            }
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isSpeaking
                                        ? "Stop speaking"
                                        : "Speak latest response"}
                                </TooltipContent>
                            </Tooltip>
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
                            onPromptClick={handlePromptClick}
                        />
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
