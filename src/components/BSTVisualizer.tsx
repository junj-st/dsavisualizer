import { useState, useCallback, useRef, useEffect } from 'react';
import type { BSTNode } from '../types';

const BORDER = '1px solid #2e2e2e';
const NODE_R = 19;

function bstInsert(root: BSTNode|null, val: number): BSTNode {
  if (!root) return { value: val, left: null, right: null };
  if (val < root.value) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.value) return { ...root, right: bstInsert(root.right, val) };
  return root;
}

function bstDelete(root: BSTNode|null, val: number): BSTNode|null {
  if (!root) return null;
  if (val < root.value) return { ...root, left: bstDelete(root.left, val) };
  if (val > root.value) return { ...root, right: bstDelete(root.right, val) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  let succ = root.right;
  while (succ.left) succ = succ.left;
  return { ...root, value: succ.value, right: bstDelete(root.right, succ.value) };
}

function bstSearchPath(root: BSTNode|null, val: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.value);
    if (val === cur.value) break;
    cur = val < cur.value ? cur.left : cur.right;
  }
  return path;
}

function layoutTree(node: BSTNode|null, x: number, y: number, dx: number): BSTNode|null {
  if (!node) return null;
  return { ...node, x, y,
    left:  layoutTree(node.left,  x-dx, y+64, dx/2),
    right: layoutTree(node.right, x+dx, y+64, dx/2),
  };
}

function collectNodes(node: BSTNode|null): BSTNode[] {
  if (!node) return [];
  return [node, ...collectNodes(node.left), ...collectNodes(node.right)];
}

function collectEdges(node: BSTNode|null): {x1:number;y1:number;x2:number;y2:number}[] {
  if (!node) return [];
  const edges: {x1:number;y1:number;x2:number;y2:number}[] = [];
  if (node.left)  edges.push({x1:node.x!,y1:node.y!,x2:node.left.x!,y2:node.left.y!});
  if (node.right) edges.push({x1:node.x!,y1:node.y!,x2:node.right.x!,y2:node.right.y!});
  return [...edges, ...collectEdges(node.left), ...collectEdges(node.right)];
}

function bstInOrder(node: BSTNode|null): number[] {
  if (!node) return [];
  return [...bstInOrder(node.left), node.value, ...bstInOrder(node.right)];
}

function buildBalanced(sorted: number[]): BSTNode|null {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return { value: sorted[mid], left: buildBalanced(sorted.slice(0, mid)), right: buildBalanced(sorted.slice(mid+1)) };
}

function treeHeight(node: BSTNode|null): number {
  if (!node) return -1;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

function countNodes(node: BSTNode|null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function isFull(node: BSTNode|null): boolean {
  if (!node) return true;
  if (!node.left && !node.right) return true;
  if (node.left && node.right) return isFull(node.left) && isFull(node.right);
  return false;
}

function isComplete(node: BSTNode|null): boolean {
  const n = countNodes(node);
  function check(nd: BSTNode|null, idx: number): boolean {
    if (!nd) return true;
    if (idx >= n) return false;
    return check(nd.left, 2*idx+1) && check(nd.right, 2*idx+2);
  }
  return check(node, 0);
}

function isPerfect(node: BSTNode|null): boolean {
  const h = treeHeight(node);
  return h >= 0 && countNodes(node) === Math.pow(2, h+1) - 1;
}

function isAVL(node: BSTNode|null): boolean {
  function checkH(nd: BSTNode|null): number {
    if (!nd) return 0;
    const l = checkH(nd.left); if (l === -1) return -1;
    const r = checkH(nd.right); if (r === -1) return -1;
    if (Math.abs(l - r) > 1) return -1;
    return Math.max(l, r) + 1;
  }
  return checkH(node) !== -1;
}

function getTreeProps(node: BSTNode|null) {
  if (!node) return null;
  const h = treeHeight(node);
  const n = countNodes(node);
  const full    = isFull(node);
  const complete = isComplete(node);
  const perfect  = isPerfect(node);
  const avl      = isAVL(node);
  const minNodes = h + 1;
  const maxNodes = Math.pow(2, h + 1) - 1;
  return { height: h, nodes: n, full, complete, perfect, avl, minNodes, maxNodes };
}

type BSTMode = 'insert' | 'delete' | 'search' | 'clear';

function Btn({ children, onClick, active, variant = 'ghost', disabled }: {
  children: React.ReactNode; onClick?: () => void;
  active?: boolean; variant?: 'ghost' | 'primary'; disabled?: boolean;
}) {
  const base = 'px-2.5 py-1 rounded text-[12px] font-medium transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed';
  const styles = {
    ghost:   active ? 'bg-white/10 text-[#e0e0e0]' : 'text-[#787774] hover:text-[#cfcdc9] hover:bg-white/[0.05]',
    primary: 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white',
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>{children}</button>;
}

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a', color: '#cfcdc9', border: '1px solid #2e2e2e',
  borderRadius: 4, padding: '4px 10px', fontSize: 12, outline: 'none', width: 88,
};

export default function BSTVisualizer() {
  const [root, setRoot] = useState<BSTNode|null>(() => {
    let r: BSTNode|null = null;
    for (const v of [50,30,70,20,40,60,80,10,35]) r = bstInsert(r, v);
    return r;
  });
  const [inputVal, setInputVal] = useState('');
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>(['BST ready.']);
  const [highlight, setHighlight] = useState<number|null>(null);
  const [mode, setMode] = useState<BSTMode>('insert');
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [panStart, setPanStart] = useState<{cx:number;cy:number;vt:{x:number;y:number;scale:number}}|null>(null);
  const hasPannedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Non-passive wheel zoom
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

  const onBgMouseDown = (e: React.MouseEvent) => {
    hasPannedRef.current = false;
    setPanStart({ cx: e.clientX, cy: e.clientY, vt: { ...viewTransform } });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!panStart) return;
    const dx = e.clientX - panStart.cx;
    const dy = e.clientY - panStart.cy;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasPannedRef.current = true;
    setViewTransform({ ...panStart.vt, x: panStart.vt.x + dx, y: panStart.vt.y + dy });
  };
  const onMouseUp = () => setPanStart(null);

  const addLog = (msg: string) => setLog(p => [msg, ...p.slice(0,9)]);

  const handleInsert = useCallback(() => {
    const v = parseInt(inputVal); if (isNaN(v)) return;
    setRoot(r => bstInsert(r, v)); setSearchPath([]); setHighlight(v);
    addLog(`Inserted ${v}`); setInputVal('');
    setTimeout(() => setHighlight(null), 1200);
  }, [inputVal]);

  const handleDelete = useCallback(() => {
    const v = parseInt(inputVal); if (isNaN(v)) return;
    setRoot(r => bstDelete(r, v)); setSearchPath([]); addLog(`Deleted ${v}`); setInputVal('');
  }, [inputVal]);

  const handleSearch = useCallback(() => {
    const v = parseInt(inputVal); if (isNaN(v)) return;
    const path = bstSearchPath(root, v);
    setSearchPath(path);
    const found = path.length > 0 && path[path.length-1] === v;
    addLog(`Search ${v}: ${found ? 'Found! Path: '+path.join('→') : 'Not found'}`);
    setInputVal('');
  }, [inputVal, root]);

  const execute = useCallback(() => {
    if (mode === 'insert') handleInsert();
    else if (mode === 'delete') handleDelete();
    else if (mode === 'search') handleSearch();
    else { setRoot(null); setSearchPath([]); addLog('Cleared.'); }
  }, [mode, handleInsert, handleDelete, handleSearch]);

  const h = treeHeight(root);
  const initDx = Math.max(110, (NODE_R + 8) * Math.pow(2, h));
  const laidOut = layoutTree(root, 380, 40, initDx);
  const nodes = collectNodes(laidOut);
  const edges = collectEdges(laidOut);

  const nodeColor = (val: number) => {
    if (highlight === val) return '#9a6420';
    if (searchPath.includes(val)) return val===searchPath[searchPath.length-1] ? '#1e7050' : '#5a3d8c';
    return '#3d5c8f';
  };

  return (
    <div className="flex flex-col h-full" style={{ padding: 12, gap: 8 }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-0.5 p-0.5 rounded-md" style={{ background: '#212121', border: BORDER }}>
          {([['insert','+ Insert'],['delete','✕ Delete'],['search','⌕ Search'],['clear','↺ Clear']] as const).map(([m,l]) => (
            <Btn key={m} onClick={()=>setMode(m)} active={mode===m}>{l}</Btn>
          ))}
        </div>

        {mode !== 'clear' && (
          <input type="number" value={inputVal} placeholder="Value"
            onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&execute()}
            style={inputStyle} />
        )}

        <Btn onClick={execute} variant={mode==='clear'?'ghost':'primary'}
          disabled={mode !== 'clear' && inputVal === ''}>
          {mode === 'insert' ? 'Insert' : mode === 'delete' ? 'Delete' : mode === 'search' ? 'Search' : 'Clear'}
        </Btn>

        <div style={{ width: 1, height: 18, background: '#2e2e2e' }} />
        <Btn onClick={() => {
          const sorted = bstInOrder(root);
          setRoot(buildBalanced(sorted));
          setSearchPath([]); setHighlight(null);
          addLog(`Balanced (${sorted.length} nodes → height ${Math.ceil(Math.log2(sorted.length + 1)) - 1})`);
        }} disabled={!root}>⊡ Balance</Btn>
        <Btn onClick={()=>setViewTransform({x:0,y:0,scale:1})}>⊙ Reset View</Btn>
      </div>

      {/* Main area */}
      <div className="flex gap-2 flex-1 min-h-0">

        {/* Tree canvas */}
        <div className="flex-1 rounded-lg overflow-hidden" style={{ background: '#141414', border: BORDER }}>
          <svg ref={svgRef} width="100%" height="100%"
            style={{ cursor: panStart ? 'grabbing' : 'grab', display: 'block' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}>
            <rect width="100%" height="100%" fill="transparent" onMouseDown={onBgMouseDown} />
            <g transform={`translate(${viewTransform.x},${viewTransform.y}) scale(${viewTransform.scale})`}>
              {edges.map((e,i) => (
                <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#2e2e2e" strokeWidth="1.5" />
              ))}
              {nodes.map(n => (
                <g key={n.value}>
                  <circle cx={n.x} cy={n.y} r={NODE_R} fill={nodeColor(n.value)}
                    stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
                    style={{ transition: 'fill 0.3s' }} />
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="12" fontWeight="600" style={{ userSelect:'none' }}>
                    {n.value}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Right panel: properties + log */}
        <div className="flex flex-col gap-2" style={{ width: 200 }}>

          {/* Tree properties */}
          {(() => {
            const props = getTreeProps(root);
            if (!props) return (
              <div className="rounded-lg p-3" style={{ background: '#1f1f1f', border: BORDER }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Properties</div>
                <div style={{ fontSize: 11, color: '#3a3a3a' }}>Empty tree</div>
              </div>
            );
            const tags: { label: string; yes: boolean; def: string }[] = [
              { label: 'Full',     yes: props.full,     def: 'Every node has 0 or 2 children' },
              { label: 'Complete', yes: props.complete, def: 'All levels filled; last level left-to-right' },
              { label: 'Perfect',  yes: props.perfect,  def: `All leaves same depth · needs ${Math.pow(2, props.height+1)-1} nodes` },
              { label: 'AVL',      yes: props.avl,      def: '|h(left) − h(right)| ≤ 1 at every node' },
            ];
            return (
              <div className="rounded-lg p-3" style={{ background: '#1f1f1f', border: BORDER }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Properties</div>
                <div style={{ fontSize: 11, color: '#4a4a4a', display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 5, columnGap: 8, marginBottom: 10 }}>
                  <span>Height</span><span style={{ color: '#cfcdc9', fontFamily: 'monospace' }}>{props.height}</span>
                  <span>Nodes</span><span style={{ color: '#cfcdc9', fontFamily: 'monospace' }}>{props.nodes}</span>
                </div>
                {tags.map(({ label, yes, def }) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div className="flex items-center gap-2">
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        background: yes ? 'rgba(30,112,80,0.25)' : 'rgba(255,255,255,0.04)',
                        border: yes ? '1px solid rgba(30,112,80,0.5)' : '1px solid #2e2e2e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {yes && <span style={{ fontSize: 9, color: '#3a9e6a' }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 11, color: yes ? '#cfcdc9' : '#4a4a4a', fontWeight: yes ? 500 : 400 }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#3a3a3a', marginLeft: 22, marginTop: 2, lineHeight: 1.4 }}>{def}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Log */}
          <div className="flex flex-col rounded-lg p-3 overflow-auto flex-1" style={{ background: '#1f1f1f', border: BORDER }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Log</div>
            {log.map((entry,i) => (
              <div key={i} style={{ fontSize: 11, color: i===0?'#cfcdc9':'#4a4a4a', padding: '1px 0' }}>{entry}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar: legend + info */}
      <div className="flex-shrink-0 flex items-center gap-4" style={{ paddingTop: 2 }}>
        {([['#3d5c8f','Normal'],['#9a6420','Inserted'],['#5a3d8c','Search path'],['#1e7050','Found']] as const).map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            {l}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>
          <span style={{ color: '#787774', fontWeight: 500 }}>Binary Search Tree</span>
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>O(log n) avg · O(n) worst</span>
        </div>
      </div>
    </div>
  );
}
