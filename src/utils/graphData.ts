import type { Graph } from '../types';

export const DEFAULT_WEIGHTED_GRAPH: Graph = {
  directed: true,
  nodes: [
    { id: 'A', x: 120, y: 200, label: 'A' },
    { id: 'B', x: 300, y: 80,  label: 'B' },
    { id: 'C', x: 300, y: 320, label: 'C' },
    { id: 'D', x: 500, y: 80,  label: 'D' },
    { id: 'E', x: 500, y: 320, label: 'E' },
    { id: 'F', x: 680, y: 200, label: 'F' },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 4 },
    { id: 'e2', from: 'A', to: 'C', weight: 2 },
    { id: 'e3', from: 'B', to: 'D', weight: 3 },
    { id: 'e4', from: 'B', to: 'C', weight: 1 },
    { id: 'e5', from: 'C', to: 'E', weight: 5 },
    { id: 'e6', from: 'D', to: 'F', weight: 2 },
    { id: 'e7', from: 'E', to: 'D', weight: 1 },
    { id: 'e8', from: 'E', to: 'F', weight: 4 },
  ],
};

export const DEFAULT_UNWEIGHTED_GRAPH: Graph = {
  directed: false,
  nodes: [
    { id: 'A', x: 120, y: 200, label: 'A' },
    { id: 'B', x: 300, y: 80,  label: 'B' },
    { id: 'C', x: 300, y: 320, label: 'C' },
    { id: 'D', x: 500, y: 80,  label: 'D' },
    { id: 'E', x: 500, y: 320, label: 'E' },
    { id: 'F', x: 680, y: 200, label: 'F' },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 1 },
    { id: 'e2', from: 'A', to: 'C', weight: 1 },
    { id: 'e3', from: 'B', to: 'D', weight: 1 },
    { id: 'e4', from: 'B', to: 'C', weight: 1 },
    { id: 'e5', from: 'C', to: 'E', weight: 1 },
    { id: 'e6', from: 'D', to: 'F', weight: 1 },
    { id: 'e7', from: 'E', to: 'D', weight: 1 },
    { id: 'e8', from: 'E', to: 'F', weight: 1 },
  ],
};

export const NEGATIVE_WEIGHT_GRAPH: Graph = {
  directed: true,
  nodes: [
    { id: 'S', x: 100, y: 200, label: 'S' },
    { id: 'A', x: 280, y: 80,  label: 'A' },
    { id: 'B', x: 280, y: 320, label: 'B' },
    { id: 'C', x: 460, y: 80,  label: 'C' },
    { id: 'D', x: 460, y: 320, label: 'D' },
    { id: 'T', x: 640, y: 200, label: 'T' },
  ],
  edges: [
    { id: 'e1', from: 'S', to: 'A', weight: 6 },
    { id: 'e2', from: 'S', to: 'B', weight: 7 },
    { id: 'e3', from: 'A', to: 'C', weight: 5 },
    { id: 'e4', from: 'A', to: 'B', weight: 8 },
    { id: 'e5', from: 'A', to: 'D', weight: -4 },
    { id: 'e6', from: 'B', to: 'D', weight: 9 },
    { id: 'e7', from: 'B', to: 'C', weight: -3 },
    { id: 'e8', from: 'D', to: 'T', weight: 7 },
    { id: 'e9', from: 'C', to: 'T', weight: -2 },
    { id: 'e10', from: 'T', to: 'A', weight: 2 },
  ],
};

export const ALGO_INFO: Record<string, { title: string; complexity: string; description: string; useCases: string[] }> = {
  dijkstra: {
    title: "Dijkstra's Algorithm",
    complexity: "O((V + E) log V)",
    description: "Greedy algorithm that finds shortest paths from a source node to all other nodes in a weighted graph with non-negative edge weights. Uses a priority queue to always process the nearest unvisited node.",
    useCases: ["GPS Navigation", "Network routing (OSPF)", "Airline flight paths", "Game pathfinding (A*)"],
  },
  'bellman-ford': {
    title: "Bellman-Ford Algorithm",
    complexity: "O(V × E)",
    description: "Dynamic programming algorithm that computes shortest paths even with negative edge weights. Relaxes all edges V-1 times and can detect negative-weight cycles.",
    useCases: ["Distance-vector routing (RIP)", "Arbitrage detection in currency exchange", "Graphs with negative weights"],
  },
  bfs: {
    title: "Breadth-First Search",
    complexity: "O(V + E)",
    description: "Explores all neighbors of a node before moving to the next level. Finds shortest paths in unweighted graphs. Uses a queue (FIFO).",
    useCases: ["Shortest path (unweighted)", "Web crawling", "Social network levels", "Flood fill"],
  },
  dfs: {
    title: "Depth-First Search",
    complexity: "O(V + E)",
    description: "Explores as far as possible along each branch before backtracking. Uses a stack (LIFO). Great for cycle detection, topological sort, and connected components.",
    useCases: ["Topological sorting", "Cycle detection", "Maze solving", "Connected components"],
  },
  bubble: {
    title: "Bubble Sort",
    complexity: "O(n²) avg/worst, O(n) best",
    description: "Repeatedly steps through the list, compares adjacent elements, and swaps them if out of order. The largest elements 'bubble' to the end each pass.",
    useCases: ["Educational purposes", "Nearly-sorted arrays (with optimization)"],
  },
  insertion: {
    title: "Insertion Sort",
    complexity: "O(n²) avg/worst, O(n) best",
    description: "Builds the sorted array one element at a time by inserting each element into its correct position in the already-sorted prefix.",
    useCases: ["Small arrays", "Online sorting (streaming data)", "Nearly-sorted arrays"],
  },
  selection: {
    title: "Selection Sort",
    complexity: "O(n²) all cases",
    description: "Finds the minimum element in the unsorted portion and places it at the beginning. Makes exactly n-1 swaps.",
    useCases: ["Minimizing writes to memory", "Small arrays", "Educational purposes"],
  },
  quick: {
    title: "Quick Sort",
    complexity: "O(n log n) avg, O(n²) worst",
    description: "Divide-and-conquer algorithm that selects a pivot, partitions elements around it, and recursively sorts both halves. Very cache-friendly in practice.",
    useCases: ["General-purpose sorting", "Arrays in practice", "Standard library sort (hybrid)"],
  },
  merge: {
    title: "Merge Sort",
    complexity: "O(n log n) all cases",
    description: "Divide-and-conquer algorithm that splits the array in half, recursively sorts both halves, then merges them. Stable sort with guaranteed O(n log n).",
    useCases: ["Stable sorting requirement", "Linked list sorting", "External sorting (disk)"],
  },
  kruskal: {
    title: "Kruskal's Algorithm",
    complexity: "O(E log E)",
    description: "Greedy MST algorithm. Sort all edges by weight, then greedily add the cheapest edge that doesn't form a cycle. Uses a Union-Find (disjoint set) data structure for O(α) cycle detection.",
    useCases: ["Network design (minimum wiring cost)", "Cluster analysis", "Image segmentation", "Approximate TSP"],
  },
  prim: {
    title: "Prim's Algorithm",
    complexity: "O(E log V)",
    description: "Greedy MST algorithm that grows the tree one node at a time. Maintains a priority queue of the cheapest edge connecting each unvisited node to the growing MST.",
    useCases: ["Dense graph MSTs", "Network infrastructure", "Maze generation", "Road planning"],
  },
  'topo-sort': {
    title: "Topological Sort",
    complexity: "O(V + E)",
    description: "DFS-based linear ordering of vertices in a directed acyclic graph (DAG) such that for every edge u→v, u appears before v. Each node is prepended to the result when its DFS finishes.",
    useCases: ["Build systems (Makefile, Webpack)", "Task scheduling", "Course prerequisite ordering", "Package dependency resolution"],
  },
};

export const DEFAULT_MST_GRAPH: Graph = {
  directed: false,
  nodes: [
    { id: 'A', x: 120, y: 200, label: 'A' },
    { id: 'B', x: 300, y: 80,  label: 'B' },
    { id: 'C', x: 300, y: 320, label: 'C' },
    { id: 'D', x: 500, y: 80,  label: 'D' },
    { id: 'E', x: 500, y: 320, label: 'E' },
    { id: 'F', x: 680, y: 200, label: 'F' },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 4 },
    { id: 'e2', from: 'A', to: 'C', weight: 2 },
    { id: 'e3', from: 'B', to: 'D', weight: 3 },
    { id: 'e4', from: 'B', to: 'C', weight: 1 },
    { id: 'e5', from: 'C', to: 'E', weight: 5 },
    { id: 'e6', from: 'D', to: 'F', weight: 2 },
    { id: 'e7', from: 'E', to: 'D', weight: 1 },
    { id: 'e8', from: 'E', to: 'F', weight: 4 },
    { id: 'e9', from: 'B', to: 'E', weight: 6 },
  ],
};

export const DEFAULT_DAG_GRAPH: Graph = {
  directed: true,
  nodes: [
    { id: 'A', x: 100, y: 200, label: 'A' },
    { id: 'B', x: 280, y: 80,  label: 'B' },
    { id: 'C', x: 280, y: 320, label: 'C' },
    { id: 'D', x: 460, y: 80,  label: 'D' },
    { id: 'E', x: 460, y: 320, label: 'E' },
    { id: 'F', x: 640, y: 200, label: 'F' },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 1 },
    { id: 'e2', from: 'A', to: 'C', weight: 1 },
    { id: 'e3', from: 'B', to: 'D', weight: 1 },
    { id: 'e4', from: 'C', to: 'D', weight: 1 },
    { id: 'e5', from: 'C', to: 'E', weight: 1 },
    { id: 'e6', from: 'D', to: 'F', weight: 1 },
    { id: 'e7', from: 'E', to: 'F', weight: 1 },
  ],
};
