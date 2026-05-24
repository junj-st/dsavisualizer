import { useState, useEffect, useRef, useCallback } from 'react';
import type { SortStep, SortAlgorithm } from '../types';
import { bubbleSortSteps } from '../algorithms/sorting/bubbleSort';
import { insertionSortSteps } from '../algorithms/sorting/insertionSort';
import { selectionSortSteps } from '../algorithms/sorting/selectionSort';
import { quickSortSteps } from '../algorithms/sorting/quickSort';
import { mergeSortSteps } from '../algorithms/sorting/mergeSort';
import { ALGO_INFO } from '../utils/graphData';

const BORDER = '1px solid #2e2e2e';

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 10);
}

// Functional colors — muted for dark canvas comfort
const BAR_COLORS = {
  default:  '#2a4470',
  compare:  '#8a5418',
  swap:     '#7a2828',
  pivot:    '#4a2c84',
  merge:    '#1c3f66',
  sorted:   '#0e5438',
};

function getBarColor(idx: number, step: SortStep | null): string {
  if (!step) return BAR_COLORS.default;
  if (step.swapping.includes(idx))  return BAR_COLORS.swap;
  if (step.comparing.includes(idx)) return BAR_COLORS.compare;
  if (step.pivot === idx)           return BAR_COLORS.pivot;
  if (step.sorted.includes(idx))    return BAR_COLORS.sorted;
  if (step.merging?.includes(idx))  return BAR_COLORS.merge;
  return BAR_COLORS.default;
}

function getBarBright(idx: number, step: SortStep | null): string {
  if (!step) return '#3f6099';
  if (step.swapping.includes(idx))  return '#b84848';
  if (step.comparing.includes(idx)) return '#c49040';
  if (step.pivot === idx)           return '#7a5cb0';
  if (step.sorted.includes(idx))    return '#2a8060';
  if (step.merging?.includes(idx))  return '#4a7aa8';
  return '#3f6099';
}

const LEGEND = [
  { color: '#3f6099', label: 'Default' },
  { color: '#c49040', label: 'Comparing' },
  { color: '#b84848', label: 'Swapping' },
  { color: '#7a5cb0', label: 'Pivot' },
  { color: '#4a7aa8', label: 'Merging' },
  { color: '#2a8060', label: 'Sorted' },
];

interface Props { algorithm: SortAlgorithm }

export default function SortingVisualizer({ algorithm }: Props) {
  const [arraySize, setArraySize] = useState(36);
  const [array, setArray] = useState(() => generateArray(36));
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(80);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;
  const displayArray = currentStep ? currentStep.array : array;
  const info = ALGO_INFO[algorithm];

  const generate = useCallback(() => {
    const a = generateArray(arraySize);
    setArray(a); setSteps([]); setStepIdx(-1); setIsPlaying(false);
  }, [arraySize]);

  useEffect(() => { generate(); }, [algorithm, generate]);

  const runSort = useCallback(() => {
    let s: SortStep[] = [];
    if (algorithm === 'bubble')    s = bubbleSortSteps(array);
    else if (algorithm === 'insertion') s = insertionSortSteps(array);
    else if (algorithm === 'selection') s = selectionSortSteps(array);
    else if (algorithm === 'quick')     s = quickSortSteps(array);
    else if (algorithm === 'merge')     s = mergeSortSteps(array);
    setSteps(s); setStepIdx(0); setIsPlaying(false);
  }, [algorithm, array]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIdx(p => { if (p >= steps.length-1) { setIsPlaying(false); return p; } return p+1; });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, steps.length]);

  const maxVal = Math.max(...displayArray, 1);

  return (
    <div className="flex flex-col h-full" style={{ padding: 12, gap: 8 }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        <button onClick={generate}
          style={{ background:'transparent', border:'1px solid #2e2e2e', color:'#787774',
            borderRadius:4, padding:'3px 10px', fontSize:12, cursor:'pointer', transition:'color 0.1s' }}
          onMouseEnter={e=>(e.currentTarget.style.color='#cfcdc9')}
          onMouseLeave={e=>(e.currentTarget.style.color='#787774')}>
          ↺ New Array
        </button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: '#787774' }}>Size</span>
          <input type="range" min={10} max={80} value={arraySize}
            onChange={e=>setArraySize(parseInt(e.target.value))}
            style={{ width: 72, accentColor: '#e0e0e0' }} />
          <span style={{ fontSize: 11, color: '#4a4a4a', width: 20 }}>{arraySize}</span>
        </div>

        <div style={{ width: 1, height: 18, background: '#2e2e2e' }} />

        <button onClick={runSort}
          style={{ background:'#2563eb', color:'white', border:'none',
            borderRadius:4, padding:'3px 12px', fontSize:12, fontWeight:500, cursor:'pointer' }}>
          Run
        </button>

        <button onClick={()=>setStepIdx(Math.max(0,stepIdx-1))} disabled={stepIdx<=0}
          style={{ background:'transparent', border:'1px solid #2e2e2e', color:'#787774',
            borderRadius:4, padding:'3px 8px', fontSize:12, cursor:'pointer', opacity:stepIdx<=0?0.3:1 }}>⏮</button>
        <button onClick={()=>setIsPlaying(p=>!p)} disabled={steps.length===0}
          style={{ background: isPlaying?'rgba(255,255,255,0.08)':'transparent',
            border:'1px solid #2e2e2e', color: isPlaying?'#e0e0e0':'#787774',
            borderRadius:4, padding:'3px 10px', fontSize:12, cursor:'pointer', opacity:steps.length===0?0.3:1 }}>
          {isPlaying?'⏸':'▶'}
        </button>
        <button onClick={()=>setStepIdx(Math.min(steps.length-1,stepIdx+1))} disabled={stepIdx>=steps.length-1}
          style={{ background:'transparent', border:'1px solid #2e2e2e', color:'#787774',
            borderRadius:4, padding:'3px 8px', fontSize:12, cursor:'pointer', opacity:stepIdx>=steps.length-1?0.3:1 }}>⏭</button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: '#787774' }}>Speed</span>
          <input type="range" min={10} max={500} step={10} value={510-speed}
            onChange={e=>setSpeed(510-parseInt(e.target.value))}
            style={{ width: 72, accentColor: '#e0e0e0' }} />
        </div>

        {steps.length > 0 && (
          <span style={{ fontSize: 11, color: '#4a4a4a', marginLeft: 'auto' }}>
            {stepIdx+1} / {steps.length}
          </span>
        )}

        {currentStep && (
          <span style={{ fontSize: 11, color: '#4a4a4a' }}>
            Comparisons: <span style={{ color: '#787774', fontFamily: 'monospace' }}>{currentStep.comparisons}</span>
            {' · '}
            Swaps: <span style={{ color: '#787774', fontFamily: 'monospace' }}>{currentStep.swaps}</span>
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden" style={{ background: '#141414', border: BORDER }}>
        <div className="flex items-end justify-center h-full px-3 pb-3 pt-2 gap-px">
          {displayArray.map((val, idx) => {
            const bright = getBarBright(idx, currentStep);
            const dark = getBarColor(idx, currentStep);
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <div style={{
                  width: '100%',
                  height: `${(val/maxVal)*100}%`,
                  background: `linear-gradient(to top, ${dark}, ${bright})`,
                  borderRadius: '1px 1px 0 0',
                  minHeight: 2,
                  transition: 'height 0.04s ease, background 0.08s ease',
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Step message */}
      {currentStep && (
        <div className="flex-shrink-0 rounded-md px-3 py-2" style={{ background: '#1f1f1f', border: BORDER }}>
          <span style={{ fontSize: 11, color: '#787774' }}>{currentStep.message}</span>
        </div>
      )}

      {/* Legend + info */}
      <div className="flex-shrink-0 flex items-center gap-4 flex-wrap">
        {LEGEND.map(({color,label}) => (
          <div key={label} className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#4a4a4a' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>
          <span style={{ color: '#787774', fontWeight: 500 }}>{info.title}</span>
          {' · '}
          <span style={{ fontFamily: 'monospace' }}>{info.complexity}</span>
        </div>
      </div>
    </div>
  );
}
