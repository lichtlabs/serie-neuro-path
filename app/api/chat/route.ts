import { streamText } from "ai";

import {
    contextAskingPrompt,
    signPrompt,
    systemPrompt,
} from "@/lib/ai/prompts";
import { aiProvider } from "@/lib/ai/provider";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

    const result = streamText({
        model: aiProvider.languageModel("chat-model"),
        messages,
        system:
            systemPrompt + "\n\n" + signPrompt + "\n\n" + contextAskingPrompt,
    });

    return result.toDataStreamResponse();
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
