import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from "ai";
import { ollama } from "ollama-ai-provider";

import { isDevelopmentEnvironment } from "@/lib/consts";

export const ollamaProvider = customProvider({
    languageModels: {
        "chat-model": ollama.chat("llava"),
        "chat-model-reasoning": wrapLanguageModel({
            model: ollama.chat("qwen3"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": ollama.chat("gemma3"),
        "artifact-model": ollama.chat("gemma3"),
    },
    imageModels: ollama.imageModel?.("llava")
        ? {
              "small-model": ollama.imageModel?.("llava"),
          }
        : undefined,
});

export const openaiProvider = customProvider({
    languageModels: {
        "chat-model": openai("gpt-4o-mini"),
        "chat-model-reasoning": wrapLanguageModel({
            model: openai("gpt-4o-mini"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": openai("gpt-4o-mini"),
        "artifact-model": openai("gpt-4o-mini"),
    },
    imageModels: {
        "small-model": openai.imageModel("dall-e-3"),
    },
});

export const googleProvider = customProvider({
    languageModels: {
        "chat-model": google("gemini-2.5-flash-preview-04-17"),
        "chat-model-reasoning": wrapLanguageModel({
            model: google("gemini-2.5-flash-preview-04-17"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": google("gemini-2.5-flash-preview-04-17"),
        "artifact-model": google("gemini-2.5-flash-preview-04-17"),
    },
    imageModels: google.imageModel?.("gemini-2.5-flash-preview-04-17")
        ? {
              "small-model": google.imageModel(
                  "gemini-2.5-flash-preview-04-17",
              ),
          }
        : undefined,
});

export const aiProvider = !isDevelopmentEnvironment
    ? ollamaProvider
    : openaiProvider;
