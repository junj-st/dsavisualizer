import type { Graph, GraphAlgoStep } from '../../types';

export function bfsSteps(graph: Graph, sourceId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const visited = new Set<string>();
  const finalized = new Set<string>();
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};

  for (const n of graph.nodes) { dist[n.id] = Infinity; prev[n.id] = null; }
  dist[sourceId] = 0;

  const queue: string[] = [sourceId];
  visited.add(sourceId);

  const snap = (cur: string | null, edge: GraphAlgoStep['activeEdge'], msg: string, q: string[]): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: cur,
    distances: { ...dist },
    predecessors: { ...prev },
    activeEdge: edge,
    finalizedNodes: new Set(finalized),
    message: msg,
    queue: [...q],
  });

  steps.push(snap(null, null, `BFS from ${sourceId}. Enqueue source. Queue: [${sourceId}]`, queue));

  while (queue.length > 0) {
    const u = queue.shift()!;
    finalized.add(u);
    steps.push(snap(u, null, `Dequeue ${u} (dist=${dist[u]}). Exploring neighbors. Queue: [${queue.join(', ')}]`, queue));

    const neighbors = graph.edges
      .filter((e) => e.from === u || (!graph.directed && e.to === u))
      .map((e) => (e.from === u ? e.to : e.from));

    for (const v of neighbors) {
      steps.push(snap(u, { from: u, to: v }, `Check neighbor ${v}: ${visited.has(v) ? 'already visited' : 'not visited yet'}.`, queue));
      if (!visited.has(v)) {
        visited.add(v);
        dist[v] = dist[u] + 1;
        prev[v] = u;
        queue.push(v);
        steps.push(snap(u, { from: u, to: v }, `Visited ${v} (dist=${dist[v]}). Enqueue. Queue: [${queue.join(', ')}]`, queue));
      }
    }
  }

  steps.push(snap(null, null, 'BFS complete! All reachable nodes visited.', []));
  return steps;
}
