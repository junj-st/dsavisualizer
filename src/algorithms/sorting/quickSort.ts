import type { SortStep } from '../../types';

export function quickSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (comparing: number[], swapping: number[], pivot: number | undefined, msg: string): SortStep => ({
    array: [...arr],
    comparing,
    swapping,
    sorted: [...sorted],
    pivot,
    message: msg,
    comparisons,
    swaps,
  });

  steps.push(snap([], [], undefined, 'Starting Quick Sort. Partition around pivot recursively.'));

  function partition(low: number, high: number): number {
    const pivotVal = arr[high];
    steps.push(snap([], [], high, `Partition [${low}..${high}]. Pivot = arr[${high}] = ${pivotVal}.`));
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push(snap([j, high], [], high, `Compare arr[${j}]=${arr[j]} ≤ pivot ${pivotVal}?`));
      if (arr[j] <= pivotVal) {
        i++;
        if (i !== j) {
          swaps++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push(snap([], [i, j], high, `Swap arr[${i}]↔arr[${j}].`));
        }
      }
    }
    swaps++;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push(snap([], [i + 1, high], i + 1, `Place pivot ${pivotVal} at position ${i+1}.`));
    return i + 1;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sorted.push(pi);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  quickSort(0, arr.length - 1);
  steps.push(snap([], [], undefined, `Quick Sort complete! ${comparisons} comparisons, ${swaps} swaps.`));
  return steps;
}
