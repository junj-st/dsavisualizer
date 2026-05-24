import type { Graph, GraphAlgoStep } from '../../types';

const INF = Infinity;

export function bellmanFordSteps(graph: Graph, sourceId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    dist[node.id] = node.id === sourceId ? 0 : INF;
    prev[node.id] = null;
  }

  const snapshot = (
    current: string | null,
    activeEdge: GraphAlgoStep['activeEdge'],
    message: string,
    iteration: number
  ): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: current,
    distances: { ...dist },
    predecessors: { ...prev },
    activeEdge,
    finalizedNodes: new Set<string>(),
    message,
    iteration,
  });

  const V = graph.nodes.length;
  steps.push(snapshot(null, null, `Starting Bellman-Ford from node ${sourceId}. Will run ${V - 1} iterations over all edges.`, 0));

  // Build edge list (handle undirected as two directed edges)
  const edges = graph.directed
    ? graph.edges
    : graph.edges.flatMap((e) => [e, { ...e, from: e.to, to: e.from }]);

  for (let i = 1; i <= V - 1; i++) {
    let updated = false;
    steps.push(snapshot(null, null, `Iteration ${i} of ${V - 1}: Relaxing all ${edges.length} edges.`, i));

    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      if (dist[u] === INF) continue;

      const alt = dist[u] + edge.weight;
      steps.push(snapshot(u, { from: u, to: v }, `Edge ${u}→${v} (w=${edge.weight}): dist[${u}]=${dist[u] === INF ? '∞' : dist[u]}, alt=${dist[u] === INF ? '∞' : alt}, dist[${v}]=${dist[v] === INF ? '∞' : dist[v]}.`, i));

      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        visited.add(v);
        updated = true;
        steps.push(snapshot(u, { from: u, to: v }, `Relaxed! dist[${v}] updated to ${alt} via ${u}.`, i));
      }
    }

    if (!updated) {
      steps.push(snapshot(null, null, `No updates in iteration ${i} — early termination!`, i));
      break;
    }
  }

  // Check for negative cycles
  let hasNegCycle = false;
  for (const edge of edges) {
    const u = edge.from;
    const v = edge.to;
    if (dist[u] !== INF && dist[u] + edge.weight < dist[v]) {
      hasNegCycle = true;
      break;
    }
  }

  const finalStep = snapshot(null, null,
    hasNegCycle
      ? '⚠ Negative-weight cycle detected! Shortest paths are undefined.'
      : 'Bellman-Ford complete! All shortest paths computed.',
    V - 1
  );
  finalStep.negativeCycle = hasNegCycle;
  steps.push(finalStep);

  return steps;
}
