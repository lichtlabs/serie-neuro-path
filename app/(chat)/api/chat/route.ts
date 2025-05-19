import { streamText } from "ai";

import { signPrompt, systemPrompt } from "@/lib/ai/prompts";
import { aiProvider } from "@/lib/ai/provider";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: aiProvider.languageModel("chat-model"),
        messages,
        system: systemPrompt + "\n\n" + signPrompt,
    });

    return result.toDataStreamResponse();
}
