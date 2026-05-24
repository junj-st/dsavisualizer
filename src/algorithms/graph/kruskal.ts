import type { Graph, GraphAlgoStep } from '../../types';

export function kruskalSteps(graph: Graph): GraphAlgoStep[] {
  const steps: GraphAlgoStep[] = [];
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
  const mstEdges = new Set<string>();
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  const visited = new Set<string>();
  const finalized = new Set<string>();
  let mstCost = 0;

  for (const node of graph.nodes) {
    parent[node.id] = node.id;
    rank[node.id] = 0;
  }

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string): boolean {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

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
    mstEdges: new Set(mstEdges),
  });

  const sorted = sortedEdges.map(e => `${e.from}–${e.to}(${e.weight})`).join(', ');
  steps.push(snapshot(null, null,
    `Kruskal's MST: Sort all ${sortedEdges.length} edges by weight: ${sorted}. Add each edge if it doesn't create a cycle.`
  ));

  for (const edge of sortedEdges) {
    steps.push(snapshot(null, { from: edge.from, to: edge.to },
      `Examining ${edge.from}–${edge.to} (w=${edge.weight}). Are ${edge.from} and ${edge.to} already connected?`
    ));

    if (union(edge.from, edge.to)) {
      mstEdges.add(edge.id);
      mstCost += edge.weight;
      visited.add(edge.from); visited.add(edge.to);
      finalized.add(edge.from); finalized.add(edge.to);
      steps.push(snapshot(null, { from: edge.from, to: edge.to },
        `✓ Added ${edge.from}–${edge.to} (w=${edge.weight}) to MST. No cycle formed. Total MST cost: ${mstCost}.`
      ));
    } else {
      steps.push(snapshot(null, null,
        `✗ Rejected ${edge.from}–${edge.to} (w=${edge.weight}). Would create a cycle — ${edge.from} and ${edge.to} are already connected.`
      ));
    }

    if (mstEdges.size === graph.nodes.length - 1) break;
  }

  steps.push(snapshot(null, null,
    `Kruskal's complete! MST has ${mstEdges.size} edges with total weight ${mstCost}.`
  ));
  return steps;
}
