import type { SortStep } from '../../types';

export function insertionSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [0];
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

  steps.push(snap([], [], 'Starting Insertion Sort. Build sorted portion left-to-right.'));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    steps.push(snap([i], [], `Pick arr[${i}]=${key} to insert into sorted portion [0..${i-1}].`));
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      steps.push(snap([j, j + 1], [], `Compare ${arr[j]} > ${key}?`));
      if (arr[j] > key) {
        swaps++;
        arr[j + 1] = arr[j];
        steps.push(snap([], [j, j + 1], `Shift arr[${j}]=${arr[j]} right to position ${j+1}.`));
        j--;
      } else {
        break;
      }
    }
    arr[j + 1] = key;
    sorted.push(i);
    steps.push(snap([], [], `Inserted ${key} at position ${j+1}.`));
  }

  steps.push(snap([], [], `Insertion Sort complete! ${comparisons} comparisons, ${swaps} shifts.`));
  return steps;
}
