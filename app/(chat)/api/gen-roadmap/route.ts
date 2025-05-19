import { generateObject, streamObject } from "ai";
import { z } from "zod";

import { systemPrompt } from "@/lib/ai/prompts";
import { aiProvider, googleProvider, openaiProvider } from "@/lib/ai/provider";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await generateObject({
        model: openaiProvider.languageModel(
            "chat-model",
        ) /* ollamaProvider.languageModel("chat-model") */,
        messages,
        system: systemPrompt,
        output: "object",
        schema: z.object({
            nodes: z.array(
                z.object({
                    id: z.string(),
                    position: z.object({
                        x: z.number(),
                        y: z.number(),
                    }),
                    data: z.record(z.any()),
                    type: z.string().optional(),
                    sourcePosition: z.string().optional(),
                    targetPosition: z.string().optional(),
                    hidden: z.boolean().optional(),
                    selected: z.boolean().optional(),
                    dragging: z.boolean().optional(),
                    draggable: z.boolean().optional(),
                    selectable: z.boolean().optional(),
                    connectable: z.boolean().optional(),
                    resizing: z.boolean().optional(),
                    deletable: z.boolean().optional(),
                    dragHandle: z.string().optional(),
                    width: z.number().nullable().optional(),
                    height: z.number().nullable().optional(),
                    parentId: z.string().optional(),
                    zIndex: z.number().optional(),
                    extent: z
                        .union([z.literal("parent"), z.array(z.number())])
                        .optional(),
                    expandParent: z.boolean().optional(),
                    ariaLabel: z.string().optional(),
                    focusable: z.boolean().optional(),
                    style: z.record(z.any()).optional(),
                    className: z.string().optional(),
                    origin: z.any().optional(),
                    handles: z.array(z.record(z.any())).optional(),
                    measured: z
                        .object({
                            width: z.number().optional(),
                            height: z.number().optional(),
                        })
                        .optional(),
                }),
            ),
            edges: z.array(
                z.object({
                    id: z.string(),
                    source: z.string(),
                    target: z.string(),
                    type: z.string().optional(),
                    sourceHandle: z.string().nullable().optional(),
                    targetHandle: z.string().nullable().optional(),
                    animated: z.boolean().optional(),
                    hidden: z.boolean().optional(),
                    deletable: z.boolean().optional(),
                    selectable: z.boolean().optional(),
                    data: z.record(z.any()).optional(),
                    selected: z.boolean().optional(),
                    markerStart: z.any().optional(),
                    markerEnd: z.any().optional(),
                    zIndex: z.number().optional(),
                    ariaLabel: z.string().optional(),
                    interactionWidth: z.number().optional(),
                    label: z.any().optional(),
                    labelStyle: z.record(z.any()).optional(),
                    labelShowBg: z.boolean().optional(),
                    labelBgStyle: z.record(z.any()).optional(),
                    labelBgPadding: z.array(z.number()).length(2).optional(),
                    labelBgBorderRadius: z.number().optional(),
                    style: z.record(z.any()).optional(),
                    className: z.string().optional(),
                    reconnectable: z
                        .union([z.boolean(), z.string()])
                        .optional(),
                    focusable: z.boolean().optional(),
                }),
            ),
        }),
    });

    return Response.json(result);
}
