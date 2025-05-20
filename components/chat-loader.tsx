import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export default function ChatLoader({ isUser }: { isUser: boolean }) {
    return (
        <div
            className={cn(
                "flex w-full items-center mt-2 mb-2",
                isUser ? "justify-end" : "justify-start",
            )}
            aria-live="polite"
        >
            <div
                className={cn(
                    "flex items-center gap-2 text-muted-foreground text-xs px-3 py-1 rounded-full bg-muted/60 border border-muted-foreground/10 shadow-sm animate-pulse",
                )}
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                {isUser ? "Sending..." : "AI is typing..."}
            </div>
        </div>
    );
}
