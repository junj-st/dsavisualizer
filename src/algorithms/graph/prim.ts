import type { Graph, GraphAlgoStep } from '../../types';

const INF = Infinity;

export function primSteps(graph: Graph, sourceId: string): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const inMST = new Set<string>();
  const mstEdges = new Set<string>();
  const visited = new Set<string>();
  const finalized = new Set<string>();

  for (const node of graph.nodes) {
    key[node.id] = INF;
    parent[node.id] = null;
  }
  key[sourceId] = 0;

  const snapshot = (
    current: string | null,
    activeEdge: GraphAlgoStep['activeEdge'],
    message: string
  ): GraphAlgoStep => ({
    visitedNodes: new Set(visited),
    currentNode: current,
    distances: { ...key },
    predecessors: { ...parent },
    activeEdge,
    finalizedNodes: new Set(finalized),
    message,
    mstEdges: new Set(mstEdges),
  });

  steps.push(snapshot(null, null,
    `Prim's MST from ${sourceId}. Key values track the cheapest edge connecting each node to the MST. Start: key[${sourceId}]=0, all others=∞.`
  ));

  for (let i = 0; i < graph.nodes.length; i++) {
    let u: string | null = null;
    for (const node of graph.nodes) {
      if (!inMST.has(node.id) && (u === null || key[node.id] < key[u])) u = node.id;
    }
    if (!u || key[u] === INF) break;

    inMST.add(u);
    visited.add(u);
    finalized.add(u);

    if (parent[u]) {
      const edge = graph.edges.find(e =>
        (e.from === parent[u] && e.to === u) ||
        (!graph.directed && e.from === u && e.to === parent[u])
      );
      if (edge) mstEdges.add(edge.id);
    }

    steps.push(snapshot(u, null,
      `Pick min-key node: ${u} (key=${key[u]})${parent[u] ? ` via ${parent[u]}` : ' (start)'}. Add to MST.`
    ));

    const neighbors = graph.edges.filter(e => e.from === u || (!graph.directed && e.to === u));
    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from;
      if (!inMST.has(v)) {
        steps.push(snapshot(u, { from: u, to: v },
          `Check edge ${u}–${v} (w=${edge.weight}). Current key[${v}]=${key[v] === INF ? '∞' : key[v]}.`
        ));
        if (edge.weight < key[v]) {
          key[v] = edge.weight;
          parent[v] = u;
          steps.push(snapshot(u, { from: u, to: v },
            `Updated key[${v}] = ${edge.weight} (cheaper path via ${u}).`
          ));
        }
      }
    }
  }

  const mstWeight = Array.from(mstEdges).reduce((sum, id) => {
    const e = graph.edges.find(e => e.id === id);
    return sum + (e?.weight ?? 0);
  }, 0);

  steps.push(snapshot(null, null,
    `Prim's complete! MST has ${mstEdges.size} edges with total weight ${mstWeight}.`
  ));
  return steps;
}
