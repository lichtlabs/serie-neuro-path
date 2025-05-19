import { generateObject } from "ai";

import { edgeGenerationPrompt, nodeGenerationPrompt } from "@/lib/ai/prompts";
import { aiProvider } from "@/lib/ai/provider";
import { roadmapEdgeDataSchema, roadmapNodeDataSchema } from "@/lib/ai/schemas";

const isDev = process.env.NODE_ENV !== "production";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        console.log(messages);

        // --- 1. NODE GENERATION ---
        const nodesResult = await generateObject({
            model: aiProvider.languageModel("chat-model"),
            messages,
            system: nodeGenerationPrompt,
            output: "array",
            schema: roadmapNodeDataSchema,
        });

        let nodes = nodesResult.object || [];

        // Ensure 'data' field exists
        nodes = nodes.map((node: any) => ({
            ...node,
            data: node.data ?? {},
        }));

        // --- 2. EDGE GENERATION ---
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
