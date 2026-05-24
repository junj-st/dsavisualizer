import { useState, useCallback, Fragment } from 'react';

interface LLNode { id: number; value: number }
let idCtr = 1;
const BORDER = '1px solid #2e2e2e';

type LLMode = 'insertHead' | 'insertTail' | 'insertAt' | 'deleteHead' | 'deleteTail' | 'search' | 'clear';

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
  borderRadius: 4, padding: '4px 10px', fontSize: 12, outline: 'none', width: 82,
};

export default function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<LLNode[]>([
    { id: idCtr++, value: 10 }, { id: idCtr++, value: 20 },
    { id: idCtr++, value: 30 }, { id: idCtr++, value: 40 },
  ]);
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [log, setLog] = useState<string[]>(['Linked list ready.']);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [mode, setMode] = useState<LLMode>('insertTail');

  const addLog = (msg: string) => setLog(p=>[msg,...p.slice(0,9)]);

  const flash = (ids: number[]) => {
    setHighlighted(ids);
    setTimeout(()=>setHighlighted([]), 900);
  };

  const insertHead = useCallback(() => {
    const v = parseInt(value); if (isNaN(v)) return;
    const n: LLNode = { id: idCtr++, value: v };
    setNodes(p=>[n,...p]); flash([n.id]);
    addLog(`Insert head: ${v}`); setValue('');
  }, [value]);

  const insertTail = useCallback(() => {
    const v = parseInt(value); if (isNaN(v)) return;
    const n: LLNode = { id: idCtr++, value: v };
    setNodes(p=>[...p,n]); flash([n.id]);
    addLog(`Insert tail: ${v}`); setValue('');
  }, [value]);

  const insertAt = useCallback(() => {
    const v = parseInt(value); const i = parseInt(index);
    if (isNaN(v)||isNaN(i)) return;
    const n: LLNode = { id: idCtr++, value: v };
    setNodes(p=>{ const arr=[...p]; arr.splice(i,0,n); return arr; });
    flash([n.id]); addLog(`Insert at ${i}: ${v}`); setValue(''); setIndex('');
  }, [value, index]);

  const deleteHead = useCallback(() => {
    if (!nodes.length) { addLog('Empty!'); return; }
    addLog(`Delete head: ${nodes[0].value}`); setNodes(p=>p.slice(1));
  }, [nodes]);

  const deleteTail = useCallback(() => {
    if (!nodes.length) { addLog('Empty!'); return; }
    addLog(`Delete tail: ${nodes[nodes.length-1].value}`); setNodes(p=>p.slice(0,-1));
  }, [nodes]);

  const search = useCallback(() => {
    const v = parseInt(value); if (isNaN(v)) return;
    const idx = nodes.findIndex(n=>n.value===v);
    if (idx===-1) { addLog(`Search ${v}: Not found`); }
    else { addLog(`Search ${v}: Found at index ${idx}`); flash([nodes[idx].id]); }
    setValue('');
  }, [value, nodes]);

  const execute = useCallback(() => {
    if (mode === 'insertHead') insertHead();
    else if (mode === 'insertTail') insertTail();
    else if (mode === 'insertAt') insertAt();
    else if (mode === 'deleteHead') deleteHead();
    else if (mode === 'deleteTail') deleteTail();
    else if (mode === 'search') search();
    else { setNodes([]); addLog('Cleared.'); }
  }, [mode, insertHead, insertTail, insertAt, deleteHead, deleteTail, search]);

  const needsValue = mode !== 'deleteHead' && mode !== 'deleteTail' && mode !== 'clear';
  const needsIndex = mode === 'insertAt';

  const MODES: [LLMode, string][] = [
    ['insertHead','↑ Head'],
    ['insertTail','↓ Tail'],
    ['insertAt','⊕ At'],
    ['deleteHead','✕ Head'],
    ['deleteTail','✕ Tail'],
    ['search','⌕ Search'],
    ['clear','↺ Clear'],
  ];

  return (
    <div className="flex flex-col h-full" style={{ padding: 12, gap: 8 }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="flex gap-0.5 p-0.5 rounded-md" style={{ background: '#212121', border: BORDER }}>
          {MODES.map(([m,l]) => (
            <Btn key={m} onClick={()=>setMode(m)} active={mode===m}>{l}</Btn>
          ))}
        </div>

        {needsValue && (
          <input type="number" value={value} placeholder="Value"
            onChange={e=>setValue(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&execute()}
            style={inputStyle} />
        )}
        {needsIndex && (
          <input type="number" value={index} placeholder="Index"
            onChange={e=>setIndex(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&execute()}
            style={{ ...inputStyle, width: 72 }} />
        )}

        <Btn onClick={execute} variant={mode==='clear'?'ghost':'primary'}
          disabled={needsValue && value === ''}>
          {mode === 'insertHead' ? 'Insert' : mode === 'insertTail' ? 'Insert' :
           mode === 'insertAt' ? 'Insert' : mode === 'deleteHead' ? 'Delete' :
           mode === 'deleteTail' ? 'Delete' : mode === 'search' ? 'Search' : 'Clear'}
        </Btn>
      </div>

      {/* Main area */}
      <div className="flex gap-2 flex-1 min-h-0">

        {/* List canvas */}
        <div className="flex-1 rounded-lg overflow-auto" style={{ background: '#141414', border: BORDER }}>
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full" style={{ color: '#3a3a3a', fontSize: 13 }}>
              List is empty
            </div>
          ) : (
            <div className="flex items-center flex-wrap gap-0 px-6 py-4" style={{ minHeight: '100%', alignContent: 'center' }}>
              <div style={{ fontSize: 10, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>HEAD</div>
              <svg width="22" height="20"><line x1="0" y1="10" x2="16" y2="10" stroke="#2e2e2e" strokeWidth="1.5"/>
                <polygon points="14,6 22,10 14,14" fill="#2e2e2e"/></svg>

              {nodes.map((node, i) => (
                <Fragment key={node.id}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: highlighted.includes(node.id) ? 'rgba(61,92,143,0.15)' : '#1f1f1f',
                    border: highlighted.includes(node.id) ? '1px solid rgba(61,92,143,0.4)' : BORDER,
                    borderRadius: 6, padding: '10px 14px', transition: 'all 0.25s',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                      color: highlighted.includes(node.id) ? '#6a8fc0' : '#cfcdc9' }}>
                      {node.value}
                    </span>
                    <span style={{ fontSize: 9, color: '#3a3a3a', marginTop: 2 }}>{i}</span>
                  </div>

                  {i < nodes.length-1 ? (
                    <svg width="28" height="20" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="10" x2="22" y2="10" stroke="#2e2e2e" strokeWidth="1.5"/>
                      <polygon points="20,6 28,10 20,14" fill="#2e2e2e"/>
                    </svg>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                      <svg width="20" height="20">
                        <line x1="0" y1="10" x2="14" y2="10" stroke="#2e2e2e" strokeWidth="1.5"/>
                      </svg>
                      <span style={{ fontSize: 10, color: '#3a3a3a', fontFamily: 'monospace' }}>null</span>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Log panel */}
        <div className="flex flex-col rounded-lg p-3" style={{ width: 180, background: '#1f1f1f', border: BORDER }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Log</div>
          <div style={{ fontSize: 11, color: '#4a4a4a', marginBottom: 8 }}>
            Nodes: <span style={{ color: '#787774', fontFamily: 'monospace' }}>{nodes.length}</span>
          </div>
          {log.map((entry,i) => (
            <div key={i} style={{ fontSize: 11, color: i===0?'#cfcdc9':'#4a4a4a', padding: '1px 0' }}>{entry}</div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 flex items-center gap-4" style={{ paddingTop: 2 }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#3d5c8f' }} />
          Highlighted
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>
          <span style={{ color: '#787774', fontWeight: 500 }}>Singly Linked List</span>
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>O(1) head · O(n) tail/search</span>
        </div>
      </div>
    </div>
  );
}
