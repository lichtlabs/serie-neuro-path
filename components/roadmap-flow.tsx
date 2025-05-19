import { Background, Controls, ReactFlow } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import CustomNode from "@/components/custom-node";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function RoadmapFlowRenderer({
    nodes,
    edges,
    isGeneratingRoadmap,
    regeneratingNodeIds = [],
    onRegenerate,
}: {
    nodes: any[];
    edges: any[];
    isGeneratingRoadmap: boolean;
    regeneratingNodeIds?: string[];
    onRegenerate?: (id: string) => void;
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
                        nodes={nodes}
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
                    <Skeleton className="w-2/3 h-8 mb-2" />
                    <Separator />
                    <p className="text-muted-foreground mt-4 text-sm">
                        No roadmap yet — ask Serie to generate one! ✨
                    </p>
                </div>
            )}
        </main>
    );
}
