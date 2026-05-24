import type { Graph, GraphAlgoStep } from '../../types';

export function dfsSteps(graph: Graph, sourceId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const visited = new Set<string>();
  const finalized = new Set<string>();
  const prev: Record<string, string | null> = {};
  const dist: Record<string, number> = {};

  for (const n of graph.nodes) { dist[n.id] = Infinity; prev[n.id] = null; }
  dist[sourceId] = 0;

  const stack: string[] = [sourceId];

  const snap = (cur: string | null, edge: GraphAlgoStep['activeEdge'], msg: string, s: string[]): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: cur,
    distances: { ...dist },
    predecessors: { ...prev },
    activeEdge: edge,
    finalizedNodes: new Set(finalized),
    message: msg,
    stack: [...s],
  });

  steps.push(snap(null, null, `DFS from ${sourceId}. Push source. Stack: [${sourceId}]`, stack));

  while (stack.length > 0) {
    const u = stack[stack.length - 1];

    if (!visited.has(u)) {
      visited.add(u);
      steps.push(snap(u, null, `Visit ${u}. Stack: [${stack.join(', ')}]`, stack));
    }

    const neighbors = graph.edges
      .filter((e) => e.from === u || (!graph.directed && e.to === u))
      .map((e) => (e.from === u ? e.to : e.from))
      .filter((v) => !visited.has(v));

    if (neighbors.length > 0) {
      const v = neighbors[0];
      prev[v] = u;
      dist[v] = dist[u] + 1;
      stack.push(v);
      steps.push(snap(u, { from: u, to: v }, `Explore edge ${u}→${v}. Push ${v}. Stack: [${stack.join(', ')}]`, stack));
    } else {
      stack.pop();
      finalized.add(u);
      steps.push(snap(u, null, `Backtrack from ${u}. Stack: [${stack.join(', ')}]`, stack));
    }
  }

  steps.push(snap(null, null, 'DFS complete! All reachable nodes visited.', []));
  return steps;
}
