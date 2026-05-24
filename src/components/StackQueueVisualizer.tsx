import { useState, useCallback } from 'react';

type DSMode = 'stack' | 'queue';
type SQAction = 'push' | 'pop' | 'peek' | 'clear';
interface Item { id: number; value: number }
let idCounter = 1;

const BORDER = '1px solid #2e2e2e';

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

export default function StackQueueVisualizer({ mode }: { mode: DSMode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState<string[]>([`${mode === 'stack' ? 'Stack' : 'Queue'} ready.`]);
  const [animIdx, setAnimIdx] = useState<number|null>(null);
  const [action, setAction] = useState<SQAction>('push');

  const addLog = (msg: string) => setLog(p=>[msg,...p.slice(0,9)]);

  const flash = (idx: number) => {
    setAnimIdx(idx);
    setTimeout(()=>setAnimIdx(null), 500);
  };

  const push = useCallback(() => {
    const v = parseInt(inputVal); if (isNaN(v)) return;
    const item: Item = { id: idCounter++, value: v };
    setItems(prev => mode==='stack' ? [item,...prev] : [...prev,item]);
    addLog(mode==='stack' ? `Push ${v}` : `Enqueue ${v}`);
    flash(0); setInputVal('');
  }, [inputVal, mode]);

  const pop = useCallback(() => {
    if (!items.length) { addLog('Empty!'); return; }
    const v = items[0].value;
    flash(0);
    setTimeout(() => {
      setItems(p=>p.slice(1));
      addLog(mode==='stack' ? `Pop → ${v}` : `Dequeue → ${v}`);
    }, 250);
  }, [items, mode]);

  const peek = useCallback(() => {
    if (!items.length) { addLog('Empty!'); return; }
    flash(0);
    addLog(`${mode==='stack'?'Peek':'Front'} = ${items[0].value}`);
  }, [items, mode]);

  const execute = useCallback(() => {
    if (action === 'push') push();
    else if (action === 'pop') pop();
    else if (action === 'peek') peek();
    else { setItems([]); addLog('Cleared.'); }
  }, [action, push, pop, peek]);

  const isStack = mode === 'stack';
  const pushLabel = isStack ? '↑ Push' : '↑ Enqueue';
  const popLabel  = isStack ? '↓ Pop'  : '↓ Dequeue';
  const needsInput = action === 'push';

  return (
    <div className="flex flex-col h-full" style={{ padding: 12, gap: 8 }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-0.5 p-0.5 rounded-md" style={{ background: '#212121', border: BORDER }}>
          {([['push', pushLabel], ['pop', popLabel], ['peek','⊙ Peek'], ['clear','↺ Clear']] as const).map(([a,l]) => (
            <Btn key={a} onClick={()=>setAction(a)} active={action===a}>{l}</Btn>
          ))}
        </div>

        {needsInput && (
          <input type="number" value={inputVal} placeholder="Value"
            onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&execute()}
            style={inputStyle} />
        )}

        <Btn onClick={execute} variant={action==='clear'?'ghost':'primary'}
          disabled={needsInput && inputVal === ''}>
          {action === 'push' ? (isStack?'Push':'Enqueue') : action === 'pop' ? (isStack?'Pop':'Dequeue') : action === 'peek' ? 'Peek' : 'Clear'}
        </Btn>
      </div>

      {/* Main area */}
      <div className="flex gap-2 flex-1 min-h-0">

        {/* Visualization canvas */}
        <div className="flex-1 rounded-lg flex items-center justify-center overflow-auto"
          style={{ background: '#141414', border: BORDER }}>
          {items.length === 0 ? (
            <div style={{ color: '#3a3a3a', fontSize: 13 }}>
              {isStack ? 'Stack is empty' : 'Queue is empty'}
            </div>
          ) : isStack ? (
            <div className="flex flex-col items-center gap-1.5 py-6">
              <div style={{ fontSize: 10, color: '#4a4a4a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOP</div>
              {items.map((item, i) => (
                <div key={item.id} style={{
                  width: 140, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: animIdx===i ? 'rgba(154,100,32,0.15)' : i===0 ? 'rgba(61,92,143,0.15)' : '#1f1f1f',
                  border: animIdx===i ? '1px solid rgba(154,100,32,0.4)' : i===0 ? '1px solid rgba(61,92,143,0.3)' : BORDER,
                  borderRadius: 4, color: animIdx===i?'#c49040':i===0?'#6a8fc0':'#787774',
                  fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                  transition: 'all 0.25s',
                  transform: animIdx===i ? 'scale(1.04)' : 'scale(1)',
                }}>
                  {item.value}
                </div>
              ))}
              <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BOTTOM</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-8">
              <div className="flex items-center gap-2">
                <div style={{ fontSize: 10, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>FRONT</div>
                {items.map((item, i) => (
                  <div key={item.id} style={{
                    width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: animIdx===i ? 'rgba(154,100,32,0.15)' : i===0 ? 'rgba(61,92,143,0.15)' : '#1f1f1f',
                    border: animIdx===i ? '1px solid rgba(154,100,32,0.4)' : i===0 ? '1px solid rgba(61,92,143,0.3)' : BORDER,
                    borderRadius: 4, color: animIdx===i?'#c49040':i===0?'#6a8fc0':'#787774',
                    fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                    transition: 'all 0.25s',
                  }}>
                    {item.value}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: 4 }}>REAR</div>
              </div>
            </div>
          )}
        </div>

        {/* Log panel */}
        <div className="flex flex-col rounded-lg p-3" style={{ width: 180, background: '#1f1f1f', border: BORDER }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a4a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Log</div>
          <div style={{ fontSize: 11, color: '#4a4a4a', marginBottom: 8 }}>
            Size: <span style={{ color: '#787774', fontFamily: 'monospace' }}>{items.length}</span>
          </div>
          {log.map((entry,i) => (
            <div key={i} style={{ fontSize: 11, color: i===0?'#cfcdc9':'#4a4a4a', padding: '1px 0' }}>{entry}</div>
          ))}
        </div>
      </div>

      {/* Bottom bar: info */}
      <div className="flex-shrink-0 flex items-center gap-4" style={{ paddingTop: 2 }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#6a8fc0' }} />
          {isStack ? 'Top (next out)' : 'Front (next out)'}
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#c49040' }} />
          Active
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>
          <span style={{ color: '#787774', fontWeight: 500 }}>{isStack ? 'Stack (LIFO)' : 'Queue (FIFO)'}</span>
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>O(1) push/pop</span>
          {' · '}
          <span style={{ color: '#3a3a3a' }}>{isStack ? 'Last in, first out' : 'First in, first out'}</span>
        </div>
      </div>
    </div>
  );
}

