import { z } from "zod";

export const roadmapNodeDataSchema = z.object({
    label: z
        .string()
        .describe("The visible title of the node (e.g., topic name)"),
    description: z
        .string()
        .describe(
            "A short description of the roadmap step, including the topic and what the user will learn.",
        )
        .optional(),
    isExpanded: z
        .boolean()
        .describe(
            "Indicates if the node's content should be shown in expanded mode",
        )
        .optional(),
    content: z
        .object({
            markdown: z
                .string()
                .describe(
                    "The full content in markdown format, used when node is expanded",
                )
                .optional(),
            html: z
                .string()
                .describe(
                    "Pre-rendered HTML version of the content, if applicable",
                )
                .optional(),
            links: z
                .array(
                    z.object({
                        label: z
                            .string()
                            .describe("Display label for the link"),
                        url: z
                            .string()
                            .url()
                            .describe("A valid URL to an external resource"),
                    }),
                )
                .describe("External resources related to this node")
                .optional(),
            examples: z
                .array(z.string())
                .describe(
                    "Example code snippets, steps, or concepts for the user",
                )
                .optional(),
            tips: z
                .array(z.string())
                .describe(
                    "Optional bullet-style tips or key points to remember",
                )
                .optional(),
        })
        .describe("Expandable content of the roadmap node")
        .optional(),
});

export const roadmapEdgeDataSchema = z.object({
    id: z.string().describe("Unique edge identifier"),
    source: z.string().describe("Source node ID"),
    target: z.string().describe("Target node ID"),
    type: z
        .string()
        .optional()
        .describe("Edge type (e.g., default, step, smoothstep)"),
    sourceHandle: z
        .string()
        .nullable()
        .optional()
        .describe("Specific handle on the source node"),
    targetHandle: z
        .string()
        .nullable()
        .optional()
        .describe("Specific handle on the target node"),
    animated: z.boolean().optional().describe("If the edge should animate"),
    hidden: z.boolean().optional().describe("Whether the edge is hidden"),
    deletable: z
        .boolean()
        .optional()
        .describe("Whether the edge can be deleted"),
    selectable: z
        .boolean()
        .optional()
        .describe("Whether the edge can be selected"),
    data: z
        .record(z.any())
        .optional()
        .describe("Optional metadata for the edge"),
    selected: z
        .boolean()
        .optional()
        .describe("If the edge is currently selected"),
    markerStart: z
        .any()
        .optional()
        .describe("Optional marker at the start of the edge"),
    markerEnd: z
        .any()
        .optional()
        .describe("Optional marker at the end of the edge"),
    zIndex: z.number().optional().describe("Edge Z-order"),
    ariaLabel: z.string().optional().describe("Accessibility label"),
    interactionWidth: z.number().optional().describe("Click zone width"),
    label: z.any().optional().describe("Optional label to show on the edge"),
    labelStyle: z
        .record(z.any())
        .optional()
        .describe("CSS style for the label"),
    labelShowBg: z
        .boolean()
        .optional()
        .describe("Whether to show label background"),
    labelBgStyle: z
        .record(z.any())
        .optional()
        .describe("Background style for the label"),
    labelBgPadding: z
        .array(z.number())
        .length(2)
        .optional()
        .describe("Padding for label background"),
    labelBgBorderRadius: z
        .number()
        .optional()
        .describe("Border radius for label background"),
    style: z.record(z.any()).optional().describe("CSS style for the edge"),
    className: z.string().optional().describe("CSS class for styling"),
    reconnectable: z
        .union([z.boolean(), z.string()])
        .optional()
        .describe("If the edge can reconnect"),
    focusable: z
        .boolean()
        .optional()
        .describe("If the edge is keyboard-focusable"),
});
