import { Handle, NodeProps, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomNode({
    data,
}: NodeProps & {
    data: {
        label: string; // Short title displayed on the node
        description?: string; // Optional subtitle or summary
        isExpanded?: boolean; // UI state: controls whether full content is shown
        content: {
            markdown?: string; // Full content in markdown format
            html?: string; // (optional) rendered HTML if markdown is precompiled
            links?: { label: string; url: string }[]; // Optional links or resources
            examples?: string[]; // Optional code or concept examples
            tips?: string[]; // Optional tips or key takeaways
        };
    };
}) {
    const [expanded, setExpanded] = useState(data?.isExpanded ?? false);

    return (
        <Card className="w-72 shadow-xl border border-muted">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    {data.label}
                </CardTitle>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </Button>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground space-y-3">
                {data.description && <p>{data.description}</p>}

                {expanded && data.content && (
                    <div className="space-y-3">
                        {data.content.markdown && (
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {data.content.markdown}
                                </ReactMarkdown>
                            </div>
                        )}

                        {data.content.links &&
                            data.content.links.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-1">
                                        🔗 Links
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {data.content.links.map(
                                            (link: any, i: number) => (
                                                <li key={i}>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline inline-flex items-center gap-1"
                                                    >
                                                        {link.label}{" "}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {data.content.examples &&
                            data.content.examples.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-1">
                                        💡 Examples
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {data.content.examples.map(
                                            (example: string, i: number) => (
                                                <li key={i}>
                                                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                                        {example}
                                                    </code>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {data.content.tips && data.content.tips.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-1">🧠 Tips</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {data.content.tips.map(
                                        (tip: string, i: number) => (
                                            <li key={i}>{tip}</li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Card>
    );
}
