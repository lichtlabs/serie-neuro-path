import { Handle, NodeProps, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomNode({
    data,
    id,
    onRegenerate,
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
            resources?: {
                section: string;
                type: string;
                title: string;
                url: string;
                discount?: string;
                tags?: string[];
            }[];
        };
        loading?: boolean;
    };
    id: string;
    onRegenerate?: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(data?.isExpanded ?? false);

    return (
        <Card className="w-72 shadow-xl border border-muted">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    {data.label}
                </CardTitle>
                <div className="flex gap-1">
                    {onRegenerate && (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onRegenerate(id)}
                            disabled={data.loading}
                            title="Regenerate this node"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h.582m15.356 2A9 9 0 106.582 9m13.356 2V9m0 0h-3"
                                />
                            </svg>
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setExpanded(!expanded)}
                        disabled={data.loading}
                    >
                        {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground space-y-3">
                {data.loading ? (
                    <div className="flex items-center justify-center h-24">
                        <svg
                            className="animate-spin w-6 h-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                    </div>
                ) : (
                    <>
                        {data.description && <p>{data.description}</p>}

                        {expanded && data.content && (
                            <div className="space-y-3">
                                {data.content.markdown && (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {data.content.markdown}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {/* Render resources grouped by section */}
                                {data.content.resources && (
                                    <div className="space-y-2">
                                        {["free", "premium"].map((section) => {
                                            const sectionResources =
                                                data.content.resources?.filter(
                                                    (r: any) =>
                                                        r.section === section,
                                                ) || [];
                                            if (sectionResources.length === 0)
                                                return null;
                                            return (
                                                <div key={section}>
                                                    <div
                                                        className={`flex items-center gap-2 mb-1 mt-2 ${section === "free" ? "text-green-700" : "text-purple-700"}`}
                                                    >
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${section === "free" ? "border-green-400 bg-green-50" : "border-purple-400 bg-purple-50"}`}
                                                        >
                                                            {section === "free"
                                                                ? "💚 Free Resources"
                                                                : "⭐ Premium Resources"}
                                                        </span>
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {sectionResources.map(
                                                            (
                                                                res: any,
                                                                i: number,
                                                            ) => (
                                                                <li
                                                                    key={i}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    {/* Type badge */}
                                                                    <span
                                                                        className={`text-xs font-semibold px-2 py-0.5 rounded bg-yellow-200 text-yellow-900 border border-yellow-300 mr-1`}
                                                                    >
                                                                        {res.type
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase() +
                                                                            res.type.slice(
                                                                                1,
                                                                            )}
                                                                    </span>
                                                                    {/* Discount badge */}
                                                                    {res.discount && (
                                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-200 text-green-900 border border-green-300 mr-1">
                                                                            {
                                                                                res.discount
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {/* Title as link */}
                                                                    <a
                                                                        href={
                                                                            res.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-medium underline hover:text-blue-600"
                                                                    >
                                                                        {
                                                                            res.title
                                                                        }
                                                                    </a>
                                                                    {/* Tags */}
                                                                    {res.tags &&
                                                                        res.tags
                                                                            .length >
                                                                            0 &&
                                                                        res.tags.map(
                                                                            (
                                                                                tag: string,
                                                                                j: number,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        j
                                                                                    }
                                                                                    className={`text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700 border border-gray-300 ml-1`}
                                                                                >
                                                                                    {
                                                                                        tag
                                                                                    }
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            );
                                        })}
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
                                                    (
                                                        example: string,
                                                        i: number,
                                                    ) => (
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

                                {data.content.tips &&
                                    data.content.tips.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-1">
                                                🧠 Tips
                                            </h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {data.content.tips.map(
                                                    (
                                                        tip: string,
                                                        i: number,
                                                    ) => (
                                                        <li key={i}>{tip}</li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </Card>
    );
}
