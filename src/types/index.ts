// ─── Graph Types ──────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

// ─── Algorithm Step Types ─────────────────────────────────────────────────────

export interface GraphAlgoStep {
  visitedNodes: Set<string>;
  currentNode: string | null;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  activeEdge: { from: string; to: string } | null;
  finalizedNodes: Set<string>;
  message: string;
  iteration?: number;          // Bellman-Ford
  negativeCycle?: boolean;     // Bellman-Ford
  queue?: string[];            // BFS
  stack?: string[];            // DFS / Topo-sort
  mstEdges?: Set<string>;      // Kruskal's, Prim's
  topoOrder?: string[];        // Topological sort
}

export type GraphAlgorithm = 'dijkstra' | 'bellman-ford' | 'bfs' | 'dfs' | 'kruskal' | 'prim' | 'topo-sort';

// ─── Sorting Types ────────────────────────────────────────────────────────────

export interface SortStep {
  array: number[];
  comparing: number[];   // indices being compared (yellow)
  swapping: number[];    // indices being swapped (red/orange)
  sorted: number[];      // indices confirmed sorted (green)
  pivot?: number;        // pivot index (purple)
  merging?: number[];    // merging range (blue)
  message: string;
  comparisons: number;
  swaps: number;
}

export type SortAlgorithm = 'bubble' | 'insertion' | 'selection' | 'quick' | 'merge';

// ─── Data Structure Types ─────────────────────────────────────────────────────

export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  x?: number;
  y?: number;
  highlight?: 'search' | 'insert' | 'delete' | 'found' | 'none';
}

export interface LinkedListNode {
  value: number;
  highlight?: 'active' | 'none';
}

export type DSType = 'bst' | 'stack' | 'queue' | 'linked-list';

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type TabType = 'graph' | 'sorting' | 'datastructures';
