import type { Graph, GraphAlgoStep } from '../../types';

export function topoSortSteps(graph: Graph): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const finalized = new Set<string>();
  const topoOrder: string[] = [];
  let hasCycle = false;

  const snapshot = (
    current: string | null,
    activeEdge: GraphAlgoStep['activeEdge'],
    message: string
  ): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: current,
    distances: {},
    predecessors: {},
    activeEdge,
    finalizedNodes: new Set(finalized),
    message,
    topoOrder: [...topoOrder],
    stack: [...inStack],
  });

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    inStack.add(nodeId);

    steps.push(snapshot(nodeId, null,
      `Enter ${nodeId}. DFS call stack: [${[...inStack].join(' → ')}]`
    ));

    const outEdges = graph.edges.filter(e => e.from === nodeId);
    for (const edge of outEdges) {
      const v = edge.to;
      if (inStack.has(v)) {
        hasCycle = true;
        steps.push(snapshot(nodeId, { from: nodeId, to: v },
          `⚠ Cycle detected: ${v} is already in the call stack (${nodeId}→${v}). Not a DAG.`
        ));
        return;
      }
      if (!visited.has(v)) {
        steps.push(snapshot(nodeId, { from: nodeId, to: v },
          `${nodeId}→${v}: recurse into ${v}.`
        ));
        dfs(v);
        if (hasCycle) return;
      } else {
        steps.push(snapshot(nodeId, { from: nodeId, to: v },
          `${nodeId}→${v}: ${v} already visited, skip.`
        ));
      }
    }

    inStack.delete(nodeId);
    finalized.add(nodeId);
    topoOrder.unshift(nodeId);
    steps.push(snapshot(nodeId, null,
      `Exit ${nodeId}. All neighbors done — prepend to result: [${topoOrder.join(' → ')}]`
    ));
  }

  steps.push(snapshot(null, null,
    `Topological Sort (DFS): visit each node; when all neighbors finish, prepend to result. Requires a DAG.`
  ));

  const sortedNodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  for (const node of sortedNodes) {
    if (!visited.has(node.id)) {
      steps.push(snapshot(null, null, `Starting DFS from ${node.id} (unvisited component).`));
      dfs(node.id);
      if (hasCycle) break;
    }
  }

  if (hasCycle) {
    steps.push(snapshot(null, null,
      `⚠ Cycle detected — topological sort is undefined for graphs with cycles.`
    ));
  } else {
    steps.push(snapshot(null, null,
      `Done! Topological order: ${topoOrder.join(' → ')}`
    ));
  }
  return steps;
}
