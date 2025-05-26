import { generateObject } from "ai";

import {
    edgeGenerationPrompt,
    nodeGenerationPrompt,
    regenerateNodePrompt,
} from "@/lib/ai/prompts";
import { aiProvider } from "@/lib/ai/provider";
import { roadmapEdgeDataSchema, roadmapNodeDataSchema } from "@/lib/ai/schemas";

const isDev = process.env.NODE_ENV !== "production";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, regenerateNodeId, previousNodes, node } = body;

        console.log("Received gen-roadmap request with options:", {
            regenerateNode: !!regenerateNodeId,
            messageCount: messages?.length || 0,
        });

        // Log the last message to see if it contains the trigger phrase
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            console.log("Last message in API call:", {
                role: lastMessage.role,
                contentSnippet:
                    typeof lastMessage.content === "string"
                        ? lastMessage.content.substring(0, 100) + "..."
                        : "Not a string content",
                containsTrigger:
                    typeof lastMessage.content === "string" &&
                    lastMessage.content.includes(
                        "I will generate the learning path for you!",
                    ),
            });
        }

        if (regenerateNodeId && node) {
            // Regenerate a single node using context
            const nodeResult = await generateObject({
                model: aiProvider.languageModel("chat-model"),
                messages,
                system:
                    regenerateNodePrompt +
                    `\n\nRegenerate the node with id: ${regenerateNodeId}.` +
                    `\n\nnode: ${JSON.stringify(node)}` +
                    `\n\npreviousNodes: ${JSON.stringify(previousNodes)}`,
                output: "object",
                schema: roadmapNodeDataSchema,
            });
            const regeneratedNode = nodeResult.object;
            return Response.json({ node: regeneratedNode });
        }

        // --- 1. NODE GENERATION ---
        console.log("Starting node generation...");
        const nodesResult = await generateObject({
            model: aiProvider.languageModel("chat-model"),
            messages,
            system: nodeGenerationPrompt,
            output: "array",
            schema: roadmapNodeDataSchema,
        });

        let nodes = nodesResult.object || [];
        console.log(`Generated ${nodes.length} nodes`);

        // Ensure 'data' field exists and set type to 'custom'
        nodes = nodes.map((node: any) => ({
            ...node,
            type: "custom",
            data: {
                ...node.data,
                // Add description if missing (required by schema)
                description:
                    node.data.description || `Learn about ${node.data.label}`,
                // Initialize isExpanded if not set
                isExpanded:
                    node.data.isExpanded !== undefined
                        ? node.data.isExpanded
                        : false,
                // Ensure content exists with required fields
                content: node.data.content || {
                    markdown: `# ${node.data.label}\n\nLearning content for ${node.data.label}`,
                    resources: [],
                },
            },
        }));

        // --- 2. EDGE GENERATION ---
        console.log("Starting edge generation...");
        const edgesResult = await generateObject({
            model: aiProvider.languageModel("chat-model"),
            messages,
            system:
                edgeGenerationPrompt +
                `\n\nHere are the node ids: ${nodes.map((n: any) => n.id).join(", ")}.`,
            output: "array",
            schema: roadmapEdgeDataSchema,
        });

        const edges = edgesResult.object || [];

        return Response.json({ nodes, edges });
    } catch (error: any) {
        console.error(error);

        if (error?.name === "ZodError" || error?.issues) {
            return Response.json(
                {
                    error: "Validation error",
                    details: isDev ? error.issues || error.message : undefined,
                },
                { status: 400 },
            );
        }

        if (error?.response || error?.statusCode) {
            return Response.json(
                {
                    error: "AI provider error",
                    details: isDev
                        ? error.message || error.response
                        : undefined,
                },
                { status: 502 },
            );
        }

        return Response.json(
            {
                error: "Failed to generate roadmap",
                details: isDev
                    ? error.stack || error.message || error
                    : undefined,
            },
            { status: 500 },
        );
    }
}
