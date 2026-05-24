import type { SortStep } from '../../types';

export function selectionSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  const snap = (comparing: number[], swapping: number[], msg: string): SortStep => ({
    array: [...arr],
    comparing,
    swapping,
    sorted: [...sorted],
    message: msg,
    comparisons,
    swaps,
  });

  steps.push(snap([], [], 'Starting Selection Sort. Find minimum and place it at front each pass.'));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(snap([i], [], `Pass ${i+1}: Looking for minimum in arr[${i}..${n-1}].`));

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push(snap([j, minIdx], [], `Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}.`));
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push(snap([minIdx], [], `New minimum: arr[${minIdx}]=${arr[minIdx]}.`));
      }
    }

    if (minIdx !== i) {
      swaps++;
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push(snap([], [i, minIdx], `Swap arr[${i}]↔arr[${minIdx}]: minimum ${arr[i]} placed at position ${i}.`));
    }
    sorted.push(i);
  }
  sorted.push(n - 1);

  steps.push(snap([], [], `Selection Sort complete! ${comparisons} comparisons, ${swaps} swaps.`));
  return steps;
}
