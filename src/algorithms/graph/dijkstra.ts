import type { Graph, GraphAlgoStep } from '../../types';

const INF = Infinity;

export function dijkstraSteps(graph: Graph, sourceId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const finalized = new Set<string>();

  for (const node of graph.nodes) {
    dist[node.id] = node.id === sourceId ? 0 : INF;
    prev[node.id] = null;
  }

  const snapshot = (
    current: string | null,
    activeEdge: GraphAlgoStep['activeEdge'],
    message: string
  ): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: current,
    distances: { ...dist },
    predecessors: { ...prev },
    activeEdge,
    finalizedNodes: new Set(finalized),
    message,
  });

  steps.push(snapshot(null, null, `Starting Dijkstra from node ${sourceId}. All distances initialized to ∞ except source (0).`));

  const unvisited = new Set(graph.nodes.map((n) => n.id));

  while (unvisited.size > 0) {
    // Pick node with smallest tentative distance
    let u: string | null = null;
    for (const id of unvisited) {
      if (u === null || dist[id] < dist[u]) u = id;
    }
    if (u === null || dist[u] === INF) break;

    visited.add(u);
    unvisited.delete(u);
    finalized.add(u);

    steps.push(snapshot(u, null, `Processing node ${u} (distance = ${dist[u]}). Examining its neighbors.`));

    // Get neighbors
    const neighbors = graph.edges.filter((e) =>
      e.from === u || (!graph.directed && e.to === u)
    );

    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from;
      if (finalized.has(v)) continue;

      const alt = dist[u] + edge.weight;
      steps.push(snapshot(u, { from: u, to: v }, `Checking edge ${u}→${v} (weight ${edge.weight}). ${dist[u]} + ${edge.weight} = ${alt} vs current dist[${v}] = ${dist[v] === INF ? '∞' : dist[v]}.`));

      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        steps.push(snapshot(u, { from: u, to: v }, `Updated dist[${v}] = ${alt} via ${u}.`));
      }
    }
  }

  steps.push(snapshot(null, null, 'Dijkstra complete! Shortest paths found for all reachable nodes.'));
  return steps;
}
