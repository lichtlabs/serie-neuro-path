import "highlight.js/styles/github.css";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ children }: { children: string }) {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    h1: (props) => (
                        <h1
                            className="text-2xl font-bold mt-4 mb-2"
                            {...props}
                        />
                    ),
                    h2: (props) => (
                        <h2
                            className="text-xl font-semibold mt-4 mb-2"
                            {...props}
                        />
                    ),
                    h3: (props) => (
                        <h3
                            className="text-lg font-semibold mt-3 mb-1"
                            {...props}
                        />
                    ),
                    h4: (props) => (
                        <h4
                            className="text-base font-semibold mt-2 mb-1"
                            {...props}
                        />
                    ),
                    h5: (props) => (
                        <h5
                            className="text-sm font-semibold mt-2 mb-1"
                            {...props}
                        />
                    ),
                    h6: (props) => (
                        <h6
                            className="text-xs font-semibold mt-2 mb-1"
                            {...props}
                        />
                    ),
                    a: (props) => (
                        <a
                            {...props}
                            className="text-blue-600 underline hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    code({ node, className, children, ...props }) {
                        return (
                            <pre
                                className={
                                    className +
                                    " rounded bg-muted p-3 overflow-x-auto"
                                }
                            >
                                <code>{children}</code>
                            </pre>
                        );
                    },
                    blockquote: (props) => (
                        <blockquote
                            className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground my-2"
                            {...props}
                        />
                    ),
                    ul: (props) => (
                        <ul className="list-disc list-inside my-2" {...props} />
                    ),
                    ol: (props) => (
                        <ol
                            className="list-decimal list-inside my-2"
                            {...props}
                        />
                    ),
                    li: (props) => <li className="mb-1" {...props} />,
                    table: (props) => (
                        <table
                            className="table-auto border-collapse my-4"
                            {...props}
                        />
                    ),
                    th: (props) => (
                        <th
                            className="border px-2 py-1 bg-muted font-semibold"
                            {...props}
                        />
                    ),
                    td: (props) => (
                        <td className="border px-2 py-1" {...props} />
                    ),
                    img: (props) => (
                        <img
                            {...props}
                            className="rounded max-h-64 object-contain my-2 mx-auto border"
                            alt={props.alt || "Markdown image"}
                        />
                    ),
                    hr: (props) => (
                        <hr className="my-4 border-muted" {...props} />
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
