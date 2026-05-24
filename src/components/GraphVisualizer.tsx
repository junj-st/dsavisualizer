import { useState, useRef, useCallback, useEffect } from 'react';
import type { Graph, GraphEdge, GraphAlgoStep, GraphAlgorithm } from '../types';
import { dijkstraSteps } from '../algorithms/graph/dijkstra';
import { bellmanFordSteps } from '../algorithms/graph/bellmanFord';
import { bfsSteps } from '../algorithms/graph/bfs';
import { dfsSteps } from '../algorithms/graph/dfs';
import { kruskalSteps } from '../algorithms/graph/kruskal';
import { primSteps } from '../algorithms/graph/prim';
import { topoSortSteps } from '../algorithms/graph/topoSort';
import { DEFAULT_WEIGHTED_GRAPH, DEFAULT_UNWEIGHTED_GRAPH, NEGATIVE_WEIGHT_GRAPH, DEFAULT_MST_GRAPH, DEFAULT_DAG_GRAPH, ALGO_INFO } from '../utils/graphData';

const NODE_R = 21;
const CANVAS_BG = '#141414';
const BORDER = '1px solid #2e2e2e';

// Node colors: muted, comfortable for dark canvas
const NODE_COLORS = {
  default:   '#3d5c8f',
  current:   '#9a6420',
  visited:   '#5a3d8c',
  finalized: '#1e7050',
};

const LEGEND = [
  { color: NODE_COLORS.default,   label: 'Unvisited' },
  { color: NODE_COLORS.current,   label: 'Current' },
  { color: NODE_COLORS.visited,   label: 'Visited' },
  { color: NODE_COLORS.finalized, label: 'Finalized / Path' },
];

function getNodeColor(id: string, step: GraphAlgoStep | null): string {
  if (!step) return NODE_COLORS.default;
  if (step.currentNode === id) return NODE_COLORS.current;
  if (step.finalizedNodes.has(id)) return NODE_COLORS.finalized;
  if (step.visitedNodes.has(id)) return NODE_COLORS.visited;
  return NODE_COLORS.default;
}

function buildShortestPath(step: GraphAlgoStep | null, targetId: string): string[] {
  if (!step) return [];
  const path: string[] = [];
  let cur: string | null = targetId;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    path.unshift(cur);
    seen.add(cur);
    cur = step.predecessors[cur] ?? null;
  }
  return path;
}

function isPathEdge(edge: GraphEdge, path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === edge.from && path[i+1] === edge.to) ||
        (path[i] === edge.to   && path[i+1] === edge.from)) return true;
  }
  return false;
}

function arrowEnd(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx+dy*dy)||1;
  return { x: x2 - (dx/len)*(NODE_R+4), y: y2 - (dy/len)*(NODE_R+4) };
}

// ── Reusable minimal button ─────────────────────────────────────────────────

function Btn({ children, onClick, active, variant = 'ghost', disabled }: {
  children: React.ReactNode; onClick?: () => void;
  active?: boolean; variant?: 'ghost'|'primary'|'danger'; disabled?: boolean;
}) {
  const base = 'px-2.5 py-1 rounded text-[12px] font-medium transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed';
  const styles = {
    ghost:   active ? 'bg-white/10 text-[#e0e0e0]' : 'text-[#787774] hover:text-[#cfcdc9] hover:bg-white/[0.05]',
    primary: 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white',
    danger:  'text-[#787774] hover:text-red-400 hover:bg-white/[0.05]',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

interface Props { algorithm: GraphAlgorithm }

export default function GraphVisualizer({ algorithm }: Props) {
  const isMST = algorithm === 'kruskal' || algorithm === 'prim';
  const isTopoSort = algorithm === 'topo-sort';
  const isWeighted = algorithm === 'dijkstra' || algorithm === 'bellman-ford' || isMST;
  const supportsNeg = algorithm === 'bellman-ford';
  const needsSource = algorithm === 'dijkstra' || algorithm === 'bellman-ford' || algorithm === 'bfs' || algorithm === 'dfs' || algorithm === 'prim';

  const [graph, setGraph] = useState<Graph>(() =>
    supportsNeg   ? NEGATIVE_WEIGHT_GRAPH
    : isMST       ? DEFAULT_MST_GRAPH
    : isTopoSort  ? DEFAULT_DAG_GRAPH
    : isWeighted  ? DEFAULT_WEIGHTED_GRAPH
    : DEFAULT_UNWEIGHTED_GRAPH
  );
  const [source, setSource] = useState(supportsNeg ? 'S' : 'A');
  const [target, setTarget] = useState(supportsNeg ? 'T' : 'F');
  const [steps, setSteps] = useState<GraphAlgoStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [addEdgeFrom, setAddEdgeFrom] = useState<string | null>(null);
  const [mode, setMode] = useState<'view'|'addNode'|'addEdge'|'deleteNode'>('view');
  const [edgeWeightInput, setEdgeWeightInput] = useState('1');
  const [showEdgeModal, setShowEdgeModal] = useState<{from:string;to:string}|null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const hasPannedRef = useRef(false);

  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [panStart, setPanStart] = useState<{cx:number;cy:number;vt:{x:number;y:number;scale:number}}|null>(null);

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const runAlgorithm = useCallback(() => {
    let s: GraphAlgoStep[] = [];
    if (algorithm === 'dijkstra')       s = dijkstraSteps(graph, source);
    else if (algorithm === 'bellman-ford') s = bellmanFordSteps(graph, source);
    else if (algorithm === 'bfs')       s = bfsSteps(graph, source);
    else if (algorithm === 'dfs')       s = dfsSteps(graph, source);
    else if (algorithm === 'kruskal')   s = kruskalSteps(graph);
    else if (algorithm === 'prim')      s = primSteps(graph, source);
    else if (algorithm === 'topo-sort') s = topoSortSteps(graph);
    setSteps(s); setStepIdx(0); setIsPlaying(false);
  }, [graph, source, algorithm]);

  useEffect(() => {
    setSteps([]); setStepIdx(-1); setIsPlaying(false);
    setGraph(supportsNeg ? NEGATIVE_WEIGHT_GRAPH : isWeighted ? DEFAULT_WEIGHTED_GRAPH : DEFAULT_UNWEIGHTED_GRAPH);
    setSource(supportsNeg ? 'S' : 'A');
    setTarget(supportsNeg ? 'T' : 'F');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  // Wheel zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setViewTransform(t => {
        const ns = Math.max(0.15, Math.min(5, t.scale * factor));
        const af = ns / t.scale;
        return { scale: ns, x: mx - (mx - t.x) * af, y: my - (my - t.y) * af };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIdx((p) => { if (p >= steps.length-1) { setIsPlaying(false); return p; } return p+1; });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, steps.length]);

  const path = buildShortestPath(currentStep, target);
  const info = ALGO_INFO[algorithm];

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (mode === 'addEdge') {
      if (!addEdgeFrom) { setAddEdgeFrom(id); return; }
      if (addEdgeFrom !== id) { setShowEdgeModal({ from: addEdgeFrom, to: id }); setAddEdgeFrom(null); }
      return;
    }
    if (mode === 'deleteNode') {
      setGraph((g) => ({ ...g, nodes: g.nodes.filter(n=>n.id!==id), edges: g.edges.filter(e=>e.from!==id&&e.to!==id) }));
      return;
    }
    e.preventDefault(); setDraggingNode(id);
  };

  const onSVGMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const gx = (e.clientX - rect.left - viewTransform.x) / viewTransform.scale;
      const gy = (e.clientY - rect.top  - viewTransform.y) / viewTransform.scale;
      setGraph(g => ({ ...g, nodes: g.nodes.map(n => n.id===draggingNode ? {...n, x:gx, y:gy} : n) }));
    } else if (panStart) {
      const dx = e.clientX - panStart.cx;
      const dy = e.clientY - panStart.cy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasPannedRef.current = true;
      setViewTransform({ ...panStart.vt, x: panStart.vt.x + dx, y: panStart.vt.y + dy });
    }
  };

  const onSVGClick = (e: React.MouseEvent) => {
    if (hasPannedRef.current) { hasPannedRef.current = false; return; }
    if (mode !== 'addNode' || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const gx = (e.clientX - rect.left - viewTransform.x) / viewTransform.scale;
    const gy = (e.clientY - rect.top  - viewTransform.y) / viewTransform.scale;
    const id = String.fromCharCode(65 + graph.nodes.length % 26) + (graph.nodes.length >= 26 ? Math.floor(graph.nodes.length/26) : '');
    setGraph((g) => ({ ...g, nodes: [...g.nodes, { id, x: gx, y: gy, label: id }] }));
  };

  const onBgMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'view') return;
    hasPannedRef.current = false;
    setPanStart({ cx: e.clientX, cy: e.clientY, vt: { ...viewTransform } });
  };

  const confirmEdge = () => {
    if (!showEdgeModal) return;
    const w = parseFloat(edgeWeightInput) || 1;
    setGraph((g) => ({ ...g, edges: [...g.edges, { id:`e${Date.now()}`, from:showEdgeModal.from, to:showEdgeModal.to, weight:w }] }));
    setShowEdgeModal(null); setEdgeWeightInput('1');
  };

  const selectStyle = {
    background: '#212121', color: '#cfcdc9', border: '1px solid #333',
    borderRadius: 4, padding: '2px 6px', fontSize: 12, outline: 'none',
  };

  return (
    <div className="flex flex-col h-full" style={{ padding: 12, gap: 8 }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mode buttons */}
        <div className="flex gap-0.5 p-0.5 rounded-md" style={{ background: '#212121', border: BORDER }}>
          {([['view','↖ Select'],['addNode','+ Node'],['addEdge','→ Edge'],['deleteNode','✕ Delete']] as const).map(([m,l]) => (
            <Btn key={m} onClick={() => setMode(m)} active={mode === m}>{l}</Btn>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: '#2e2e2e' }} />

        {needsSource && (
          <>
            <label style={{ color: '#787774', fontSize: 12 }}>Source</label>
            <select value={source} onChange={e=>setSource(e.target.value)} style={selectStyle}>
              {graph.nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </>
        )}
        {isWeighted && !isMST && (
          <>
            <label style={{ color: '#787774', fontSize: 12 }}>Target</label>
            <select value={target} onChange={e=>setTarget(e.target.value)} style={selectStyle}>
              {graph.nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </>
        )}

        <Btn onClick={runAlgorithm} variant="primary">Run</Btn>

        {/* Playback */}
        <div style={{ width: 1, height: 18, background: '#2e2e2e' }} />
        <Btn onClick={()=>setStepIdx(Math.max(0,stepIdx-1))} disabled={stepIdx<=0}>⏮</Btn>
        <Btn onClick={()=>setIsPlaying(p=>!p)} disabled={steps.length===0} active={isPlaying}>
          {isPlaying ? '⏸' : '▶'}
        </Btn>
        <Btn onClick={()=>setStepIdx(Math.min(steps.length-1,stepIdx+1))} disabled={stepIdx>=steps.length-1}>⏭</Btn>

        <div className="flex items-center gap-2">
          <span style={{ color: '#787774', fontSize: 11 }}>Speed</span>
          <input type="range" min={100} max={2000} step={100} value={2100-speed}
            onChange={e=>setSpeed(2100-parseInt(e.target.value))}
            style={{ width: 64, accentColor: '#e0e0e0' }} />
        </div>

        <div style={{ width: 1, height: 18, background: '#2e2e2e' }} />
        <Btn onClick={()=>setViewTransform({x:0,y:0,scale:1})}>⊙ Reset</Btn>

        {steps.length > 0 && (
          <span style={{ color: '#4a4a4a', fontSize: 11, marginLeft: 'auto' }}>
            {stepIdx+1} / {steps.length}
          </span>
        )}
      </div>

      {/* Main area */}
      <div className="flex gap-2 flex-1 min-h-0">

        {/* Canvas */}
        <div className="flex-1 rounded-lg overflow-hidden relative" style={{ background: CANVAS_BG, border: BORDER }}>
          {mode === 'addEdge' && addEdgeFrom && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-[11px] px-3 py-1 rounded-full"
              style={{ background: '#2563eb', color: 'white' }}>
              Click target node for edge from {addEdgeFrom}
            </div>
          )}
          <svg ref={svgRef} className="w-full h-full"
            style={{ cursor: mode==='addNode' ? 'crosshair' : panStart ? 'grabbing' : mode==='view' ? 'grab' : 'default' }}
            onClick={onSVGClick} onMouseMove={onSVGMouseMove}
            onMouseUp={()=>{ setDraggingNode(null); setPanStart(null); }}
            onMouseLeave={()=>{ setDraggingNode(null); setPanStart(null); }}>
            <defs>
              {[['arrow','#3a3a3a'],['arrow-active','#9a6420'],['arrow-path','#1e7050']].map(([id,fill])=>(
                <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={fill} />
                </marker>
              ))}
            </defs>
            {/* Background rect captures mouse events for panning */}
            <rect width="100%" height="100%" fill="transparent" onMouseDown={onBgMouseDown} />
            <g transform={`translate(${viewTransform.x},${viewTransform.y}) scale(${viewTransform.scale})`}>

            {graph.edges.map((edge) => {
              const f = graph.nodes.find(n=>n.id===edge.from);
              const t = graph.nodes.find(n=>n.id===edge.to);
              if (!f || !t) return null;
              const isActive = currentStep?.activeEdge?.from===edge.from && currentStep?.activeEdge?.to===edge.to;
              const onPath = isPathEdge(edge, path);
              const isInMST = currentStep?.mstEdges?.has(edge.id) ?? false;
              const ep = graph.directed ? arrowEnd(f.x,f.y,t.x,t.y) : {x:t.x,y:t.y};
              const color = isInMST ? '#1e7050' : onPath ? '#1e7050' : isActive ? '#9a6420' : '#3a3a3a';
              const width = isInMST || onPath ? 2.5 : isActive ? 2 : 1.5;
              return (
                <g key={edge.id}>
                  <line x1={f.x} y1={f.y} x2={ep.x} y2={ep.y}
                    stroke={color} strokeWidth={width}
                    markerEnd={graph.directed?(isInMST||onPath?'url(#arrow-path)':isActive?'url(#arrow-active)':'url(#arrow)'):undefined}/>
                  {isWeighted && (
                    <text x={(f.x+t.x)/2} y={(f.y+t.y)/2-6} textAnchor="middle"
                      fill={isActive||onPath||isInMST?color:'#4a4a4a'} fontSize="11" fontWeight="500" className="select-none">
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}

            {graph.nodes.map((node) => {
              const color = getNodeColor(node.id, currentStep);
              return (
                <g key={node.id} onMouseDown={e=>onNodeMouseDown(e,node.id)}
                  style={{ cursor: mode==='view'?'grab':'pointer' }}>
                  {node.id===source && (
                    <circle cx={node.x} cy={node.y} r={NODE_R+7} fill="none"
                      stroke="#3d5c8f" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
                  )}
                  <circle cx={node.x} cy={node.y} r={NODE_R} fill={color}
                    stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"
                    style={{
                      transition: 'fill 0.25s',
                      filter: currentStep?.currentNode===node.id ? 'drop-shadow(0 0 5px rgba(154,100,32,0.45))' : 'none',
                    }}/>
                  <text x={node.x} y={node.y+1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="13" fontWeight="600" className="select-none pointer-events-none">
                    {node.label}
                  </text>
                  {currentStep && currentStep.distances[node.id] !== undefined && (
                    <text x={node.x} y={node.y+NODE_R+14} textAnchor="middle"
                      fill="#5c5c5c" fontSize="10" className="select-none pointer-events-none">
                      {currentStep.distances[node.id]===Infinity?'∞':currentStep.distances[node.id]}
                    </text>
                  )}
                </g>
              );
            })}
            </g>
          </svg>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-2" style={{ width: 200 }}>

          {/* Step message */}
          {currentStep && (
            <div className="rounded-lg p-3 flex-shrink-0" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, color: '#9b9a97', lineHeight: 1.55 }}>{currentStep.message}</div>
              {currentStep.negativeCycle && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: 500 }}>⚠ Negative cycle</div>
              )}
            </div>
          )}

          {/* Distance table (shortest-path algos only) */}
          {currentStep && isWeighted && !isMST && (
            <div className="rounded-lg p-3 flex-1 overflow-auto" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Distances
              </div>
              <table className="w-full" style={{ fontSize: 11 }}>
                <thead>
                  <tr style={{ color: '#4a4a4a', borderBottom: '1px solid #2e2e2e' }}>
                    <th className="text-left pb-1">Node</th>
                    <th className="text-right pb-1">Dist</th>
                    <th className="text-right pb-1">Via</th>
                  </tr>
                </thead>
                <tbody>
                  {graph.nodes.map(n => (
                    <tr key={n.id} style={{
                      color: currentStep.currentNode===n.id ? '#9a6420'
                           : currentStep.finalizedNodes.has(n.id) ? '#1e7050'
                           : '#787774',
                      borderBottom: '1px solid #1f1f1f',
                    }}>
                      <td className="py-0.5 font-semibold">{n.id}</td>
                      <td className="text-right">{currentStep.distances[n.id]===Infinity?'∞':currentStep.distances[n.id]}</td>
                      <td className="text-right">{currentStep.predecessors[n.id]??'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BFS/DFS queue */}
          {currentStep && (algorithm==='bfs'||algorithm==='dfs') && (
            <div className="rounded-lg p-3" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {algorithm==='bfs'?'Queue':'Stack'}
              </div>
              <div style={{ fontSize: 11, color: '#d97706', fontFamily: 'monospace' }}>
                [{(algorithm==='bfs'?currentStep.queue:currentStep.stack)?.join(', ')??''}]
              </div>
            </div>
          )}

          {/* MST info (Kruskal's / Prim's) */}
          {currentStep && isMST && (
            <div className="rounded-lg p-3 flex-1 overflow-auto" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                MST Edges
              </div>
              {currentStep.mstEdges && currentStep.mstEdges.size > 0 ? (
                <>
                  {[...currentStep.mstEdges].map(edgeId => {
                    const e = graph.edges.find(ed => ed.id === edgeId);
                    return e ? (
                      <div key={edgeId} className="flex items-center justify-between py-0.5"
                        style={{ fontSize: 11, color: '#2d9468', borderBottom: '1px solid #1f1f1f' }}>
                        <span style={{ fontFamily: 'monospace' }}>{e.from} – {e.to}</span>
                        <span style={{ color: '#1e7050' }}>{e.weight}</span>
                      </div>
                    ) : null;
                  })}
                  <div style={{ fontSize: 11, color: '#787774', marginTop: 8, borderTop: '1px solid #2e2e2e', paddingTop: 6 }}>
                    Total: <span style={{ color: '#cfcdc9', fontFamily: 'monospace' }}>
                      {[...currentStep.mstEdges].reduce((s, id) => s + (graph.edges.find(e=>e.id===id)?.weight??0), 0)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: '#4a4a4a' }}>No edges added yet</div>
              )}
            </div>
          )}

          {/* Prim's key values */}
          {currentStep && algorithm === 'prim' && (
            <div className="rounded-lg p-3" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Key Values
              </div>
              {graph.nodes.map(n => (
                <div key={n.id} className="flex justify-between py-0.5"
                  style={{ fontSize: 11, borderBottom: '1px solid #1f1f1f',
                    color: currentStep.finalizedNodes.has(n.id) ? '#1e7050' : currentStep.currentNode===n.id ? '#9a6420' : '#787774' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{n.id}</span>
                  <span>{currentStep.distances[n.id] === Infinity ? '∞' : currentStep.distances[n.id]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Topo sort order */}
          {currentStep && isTopoSort && (
            <div className="rounded-lg p-3 flex-1 overflow-auto" style={{ background: '#212121', border: BORDER }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Call Stack
              </div>
              <div style={{ fontSize: 11, color: '#d97706', fontFamily: 'monospace', marginBottom: 10 }}>
                [{currentStep.stack?.join(' → ') ?? ''}]
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9b9a97', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Topo Order
              </div>
              {currentStep.topoOrder && currentStep.topoOrder.length > 0 ? (
                <div style={{ fontSize: 13, color: '#2d9468', fontFamily: 'monospace', lineHeight: 1.8 }}>
                  {currentStep.topoOrder.join(' → ')}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#4a4a4a' }}>Not yet determined</div>
              )}
            </div>
          )}

          {/* Shortest path */}
          {currentStep && path.length>1 && isWeighted && (
            <div className="rounded-lg p-3" style={{ background: '#0e1e16', border: '1px solid #1c3226' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1e7050', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Path → {target}
              </div>
              <div style={{ fontSize: 11, color: '#2d9468', fontFamily: 'monospace', wordBreak: 'break-all' }}>{path.join(' → ')}</div>
              <div style={{ fontSize: 11, color: '#1e7050', marginTop: 4 }}>
                Cost: {currentStep.distances[target]===Infinity?'∞':currentStep.distances[target]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: legend + info */}
      <div className="flex-shrink-0 flex items-center gap-4" style={{ paddingTop: 4 }}>
        {LEGEND.map(({color,label}) => (
          <div key={label} className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>
          <span style={{ color: '#787774', fontWeight: 500 }}>{info.title}</span>
          {' · '}
          <span style={{ fontFamily: 'monospace', color: '#4a4a4a' }}>{info.complexity}</span>
        </div>
      </div>

      {/* Edge modal */}
      {showEdgeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }} onClick={()=>setShowEdgeModal(null)}>
          <div className="rounded-lg p-5 w-60" style={{ background: '#252525', border: BORDER }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 12 }}>
              Add edge {showEdgeModal.from} → {showEdgeModal.to}
            </div>
            {isWeighted && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: '#787774', display: 'block', marginBottom: 4 }}>Weight</label>
                <input type="number" value={edgeWeightInput} onChange={e=>setEdgeWeightInput(e.target.value)}
                  autoFocus style={{ width: '100%', background: '#1a1a1a', color: '#e0e0e0', border: '1px solid #383838',
                    borderRadius: 4, padding: '4px 8px', fontSize: 13, outline: 'none' }} />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={confirmEdge} style={{ flex:1, background:'#2563eb', color:'white', border:'none', borderRadius:4, padding:'6px 0', fontSize:12, cursor:'pointer' }}>
                Add Edge
              </button>
              <button onClick={()=>setShowEdgeModal(null)} style={{ flex:1, background:'transparent', color:'#787774', border:'1px solid #383838', borderRadius:4, padding:'6px 0', fontSize:12, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
