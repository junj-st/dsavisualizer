import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import type { GraphAlgorithm, SortAlgorithm, DSType, TabType } from './types';
import GraphVisualizer from './components/GraphVisualizer';
import SortingVisualizer from './components/SortingVisualizer';
import BSTVisualizer from './components/BSTVisualizer';
import StackQueueVisualizer from './components/StackQueueVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';

const GRAPH_ALGOS: { value: GraphAlgorithm; label: string; tag: string }[] = [
  { value: 'dijkstra',     label: "Dijkstra's",      tag: "Weighted shortest path" },
  { value: 'bellman-ford', label: 'Bellman-Ford',     tag: "Handles negative weights" },
  { value: 'bfs',          label: 'BFS',              tag: "Unweighted shortest path" },
  { value: 'dfs',          label: 'DFS',              tag: "Depth-first traversal" },
  { value: 'kruskal',      label: "Kruskal's MST",    tag: "Minimum spanning tree" },
  { value: 'prim',         label: "Prim's MST",       tag: "Minimum spanning tree" },
  { value: 'topo-sort',    label: 'Topological Sort', tag: "DAG ordering" },
];

const SORT_ALGOS: { value: SortAlgorithm; label: string; tag: string }[] = [
  { value: 'bubble',    label: 'Bubble Sort',    tag: 'O(n²)' },
  { value: 'insertion', label: 'Insertion Sort', tag: 'O(n²)' },
  { value: 'selection', label: 'Selection Sort', tag: 'O(n²)' },
  { value: 'quick',     label: 'Quick Sort',     tag: 'O(n log n)' },
  { value: 'merge',     label: 'Merge Sort',     tag: 'O(n log n)' },
];

const DS_TYPES: { value: DSType; label: string; tag: string }[] = [
  { value: 'bst',         label: 'Binary Search Tree', tag: 'Hierarchical' },
  { value: 'linked-list', label: 'Linked List',        tag: 'Sequential' },
  { value: 'stack',       label: 'Stack',              tag: 'LIFO' },
  { value: 'queue',       label: 'Queue',              tag: 'FIFO' },
];

const TABS: { value: TabType; label: string }[] = [
  { value: 'graph',          label: 'Graph Algorithms' },
  { value: 'sorting',        label: 'Sorting' },
  { value: 'datastructures', label: 'Data Structures' },
];

function NavItem({ label, tag, active, onClick }: {
  label: string; tag: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      style={{ background: active ? 'rgba(255,255,255,0.06)' : 'transparent' }}
      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors duration-100 ${
        active ? 'text-[#e0e0e0]' : 'text-[#787774] hover:text-[#cfcdc9] hover:bg-white/[0.04]'
      }`}>
      <div className="text-[13px] font-medium leading-snug">{label}</div>
      <div className="text-[11px] mt-0.5" style={{ color: active ? '#737373' : '#4a4a4a' }}>{tag}</div>
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('graph');
  const [graphAlgo, setGraphAlgo] = useState<GraphAlgorithm>('dijkstra');
  const [sortAlgo,  setSortAlgo]  = useState<SortAlgorithm>('bubble');
  const [dsType,    setDsType]    = useState<DSType>('bst');

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#191919', color: '#e0e0e0' }}>
      {/* Header */}
      <header className="flex items-center h-11 px-4 flex-shrink-0" style={{ borderBottom: '1px solid #2e2e2e' }}>
        <span className="text-sm font-semibold tracking-tight mr-6" style={{ color: '#e0e0e0' }}>
          DSA Visualizer
        </span>
        <nav className="flex">
          {TABS.map(({ value, label }) => (
            <button key={value} onClick={() => setActiveTab(value)}
              className="px-4 h-11 text-[13px] font-medium transition-colors duration-100 relative"
              style={{
                color: activeTab === value ? '#e0e0e0' : '#787774',
                borderBottom: activeTab === value ? '1px solid #e0e0e0' : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto"
          style={{ borderRight: '1px solid #2e2e2e', background: '#191919' }}>
          <div className="px-2.5 mb-2 text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#4a4a4a' }}>
            {activeTab === 'datastructures' ? 'Structures' : 'Algorithms'}
          </div>
          {activeTab === 'graph' && GRAPH_ALGOS.map((a) => (
            <NavItem key={a.value} label={a.label} tag={a.tag} active={graphAlgo === a.value} onClick={() => setGraphAlgo(a.value)} />
          ))}
          {activeTab === 'sorting' && SORT_ALGOS.map((a) => (
            <NavItem key={a.value} label={a.label} tag={a.tag} active={sortAlgo === a.value} onClick={() => setSortAlgo(a.value)} />
          ))}
          {activeTab === 'datastructures' && DS_TYPES.map((d) => (
            <NavItem key={d.value} label={d.label} tag={d.tag} active={dsType === d.value} onClick={() => setDsType(d.value)} />
          ))}
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden">
          {activeTab === 'graph' && <GraphVisualizer key={graphAlgo} algorithm={graphAlgo} />}
          {activeTab === 'sorting' && <SortingVisualizer key={sortAlgo} algorithm={sortAlgo} />}
          {activeTab === 'datastructures' && dsType === 'bst'         && <BSTVisualizer key="bst" />}
          {activeTab === 'datastructures' && dsType === 'linked-list' && <LinkedListVisualizer key="ll" />}
          {activeTab === 'datastructures' && dsType === 'stack'       && <StackQueueVisualizer key="stack" mode="stack" />}
          {activeTab === 'datastructures' && dsType === 'queue'       && <StackQueueVisualizer key="queue" mode="queue" />}
        </main>
      </div>

      {/* Credits */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: '1px solid #2e2e2e' }}>
        <span style={{ fontSize: 11, color: '#4a4a4a' }}>made by Jun Jiang</span>
      </div>
      <Analytics />
    </div>
  );
}
