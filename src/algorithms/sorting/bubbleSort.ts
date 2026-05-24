import type { SortStep } from '../../types';

export function bubbleSortSteps(input: number[]): SortStep[] {
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

  steps.push(snap([], [], 'Starting Bubble Sort. Repeatedly swapping adjacent elements.'));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push(snap([j, j + 1], [], `Compare arr[${j}]=${arr[j]} and arr[${j+1}]=${arr[j+1]}.`));
      if (arr[j] > arr[j + 1]) {
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push(snap([], [j, j + 1], `Swap! arr[${j}]↔arr[${j+1}] → [${arr[j]}, ${arr[j+1]}].`));
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);

  steps.push(snap([], [], `Bubble Sort complete! ${comparisons} comparisons, ${swaps} swaps.`));
  return steps;
}
