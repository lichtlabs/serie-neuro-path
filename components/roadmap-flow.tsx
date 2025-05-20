import { Background, Controls, Node, ReactFlow } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import CustomNode from "@/components/custom-node";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { rebalanceNodes } from "@/lib/utils";

export function RoadmapFlowRenderer({
    nodes,
    edges,
    isGeneratingRoadmap,
    regeneratingNodeIds = [],
    onRegenerate,
    onPromptClick,
}: {
    nodes: Node[];
    edges: any[];
    isGeneratingRoadmap: boolean;
    regeneratingNodeIds?: string[];
    onRegenerate?: (id: string) => void;
    onPromptClick?: (prompt: string) => void;
}) {
    // Memoize nodeTypes to inject loading and onRegenerate into CustomNode
    const customNodeTypes = useMemo(
        () => ({
            custom: function CustomNodeWithProps(props: any) {
                return (
                    <CustomNode
                        {...props}
                        id={props.id}
                        data={{
                            ...props.data,
                            loading: regeneratingNodeIds.includes(props.id),
                        }}
                        onRegenerate={onRegenerate}
                    />
                );
            },
        }),
        [regeneratingNodeIds, onRegenerate],
    );

    const rebalancedNodes = nodes;

    return (
        <main className="flex flex-1 h-full w-full p-4 bg-muted/30">
            {isGeneratingRoadmap ? (
                <Card className="w-full h-full flex items-center justify-center shadow-md">
                    <CardContent className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm">
                            Generating your roadmap…
                        </p>
                    </CardContent>
                </Card>
            ) : nodes?.length > 0 && edges?.length > 0 ? (
                <div className="w-full h-full relative rounded-lg overflow-hidden shadow-sm text-black">
                    <ReactFlow
                        nodes={rebalancedNodes}
                        edges={edges}
                        nodeTypes={customNodeTypes}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <p className="text-muted-foreground mt-4 text-sm">
                        No roadmap yet — ask Serie to generate one! ✨
                    </p>
                    <Separator className="w-full my-4" />
                    <Card className="w-full max-w-md mb-6 shadow-md border border-primary/20 bg-background/80">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-primary font-semibold text-base">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Try one of these to get started:
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2 justify-center">
                            {[
                                "I want to learn web development from scratch.",
                                "I want to learn data science.",
                                "How do I start with AI?",
                                "Give me a roadmap for frontend development.",
                                "I want to become a backend developer.",
                            ].map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium cursor-pointer hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/60 focus:outline-none transition-all text-sm shadow-sm active:scale-95"
                                    onClick={() =>
                                        onPromptClick && onPromptClick(prompt)
                                    }
                                    tabIndex={0}
                                    aria-label={`Insert recommended prompt: ${prompt}`}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            onPromptClick &&
                                                onPromptClick(prompt);
                                        }
                                    }}
                                >
                                    <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span>{prompt}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}
