import { Edge, Node } from "@xyflow/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function rebalanceNodes(
    nodes: Node[],
    edges: Edge[],
    { horizontalGap = 800, verticalGap = 800, x0 = 0, y0 = 0 } = {},
): Node[] {
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    nodes.forEach((n) => {
        adj[n.id] = [];
        inDegree[n.id] = 0;
    });
    edges.forEach(({ source, target }) => {
        adj[source].push(target);
        inDegree[target] = (inDegree[target] || 0) + 1;
    });

    const queue: string[] = nodes
        .filter((n) => inDegree[n.id] === 0)
        .map((n) => n.id);
    const levels: Record<string, number> = {};
    let maxLevel = 0;
    while (queue.length) {
        const id = queue.shift()!;
        const level = levels[id] || 0;
        maxLevel = Math.max(maxLevel, level);
        adj[id].forEach((child) => {
            levels[child] = Math.max(levels[child] || 0, level + 1);
            inDegree[child]--;
            if (inDegree[child] === 0) queue.push(child);
        });
    }

    const nodesByLevel: Record<number, Node[]> = {};
    nodes.forEach((n) => {
        const level = levels[n.id] || 0;
        if (!nodesByLevel[level]) nodesByLevel[level] = [];
        nodesByLevel[level].push(n);
    });

    const newNodes = nodes.map((n) => {
        const level = levels[n.id] || 0;
        const index = nodesByLevel[level].findIndex((node) => node.id === n.id);
        return {
            ...n,
            position: {
                x: x0 + level * horizontalGap,
                y: y0 + index * verticalGap,
            },
        };
    });

    return newNodes;
}
