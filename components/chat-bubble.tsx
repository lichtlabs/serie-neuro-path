import { UIMessage } from "ai";
import { BotIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { MarkdownRenderer } from "./ui/markdown";

function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatBubble({
    message,
    showAvatar,
    isUser,
    timestamp,
}: {
    message: UIMessage;
    showAvatar: boolean;
    isUser: boolean;
    timestamp: Date;
}) {
    return (
        <div
            className={cn(
                "flex w-full transition-all duration-300 group",
                isUser ? "justify-end" : "justify-start",
            )}
            style={{ marginTop: 2, marginBottom: 2 }}
        >
            {/* Avatar */}
            {!isUser && showAvatar && (
                <div className="flex flex-col items-end mr-2 select-none">
                    <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center shadow text-white">
                        <BotIcon className="w-4 h-4" />
                    </div>
                </div>
            )}
            <div
                className={cn(
                    "relative max-w-xl px-4 py-2 rounded-xl border shadow-sm transition-all duration-300",
                    isUser
                        ? "bg-primary/90 text-primary-foreground border-primary"
                        : "bg-muted/90 text-foreground border-muted-foreground/20",
                )}
                tabIndex={0}
                aria-label={isUser ? "User message" : "AI message"}
                style={{ minWidth: 80 }}
            >
                {message.parts.map((part, i) =>
                    part.type === "text" ? (
                        isUser ? (
                            <div
                                key={`${message.id}-${i}`}
                                className="whitespace-pre-wrap"
                            >
                                {part.text}
                            </div>
                        ) : (
                            <MarkdownRenderer key={`${message.id}-${i}`}>
                                {part.text}
                            </MarkdownRenderer>
                        )
                    ) : null,
                )}
                <div className="text-xs text-muted-foreground mt-2 text-right opacity-80 group-hover:opacity-100 transition-opacity">
                    {formatTime(timestamp)}
                </div>
            </div>
            {/* User avatar on right */}
            {isUser && showAvatar && (
                <div className="flex flex-col items-end ml-2 select-none">
                    <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center shadow text-white">
                        <UserIcon className="w-4 h-4" />
                    </div>
                </div>
            )}
        </div>
    );
}
