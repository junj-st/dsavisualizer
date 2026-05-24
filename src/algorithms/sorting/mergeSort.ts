import type { SortStep } from '../../types';

export function mergeSortSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...input];
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (comparing: number[], swapping: number[], merging: number[], msg: string): SortStep => ({
    array: [...arr],
    comparing,
    swapping,
    sorted: [...sorted],
    merging,
    message: msg,
    comparisons,
    swaps,
  });

  steps.push(snap([], [], [], 'Starting Merge Sort. Divide array into halves, then merge sorted halves.'));

  function merge(low: number, mid: number, high: number) {
    const left = arr.slice(low, mid + 1);
    const right = arr.slice(mid + 1, high + 1);
    const range = Array.from({ length: high - low + 1 }, (_, i) => low + i);

    steps.push(snap([], [], range, `Merge [${low}..${mid}] and [${mid+1}..${high}].`));

    let i = 0, j = 0, k = low;
    while (i < left.length && j < right.length) {
      comparisons++;
      steps.push(snap([low + i, mid + 1 + j], [], range, `Compare ${left[i]} and ${right[j]}.`));
      if (left[i] <= right[j]) {
        arr[k] = left[i++];
      } else {
        arr[k] = right[j++];
      }
      swaps++;
      steps.push(snap([], [k], range, `Place ${arr[k]} at index ${k}.`));
      k++;
    }
    while (i < left.length) { arr[k] = left[i++]; swaps++; k++; }
    while (j < right.length) { arr[k] = right[j++]; swaps++; k++; }

    for (let idx = low; idx <= high; idx++) sorted.push(idx);
    steps.push(snap([], [], range, `Merged segment [${low}..${high}] = [${arr.slice(low, high+1).join(', ')}].`));
  }

  function mergeSort(low: number, high: number) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      steps.push(snap([], [], Array.from({ length: high - low + 1 }, (_, i) => low + i), `Split [${low}..${high}] → [${low}..${mid}] and [${mid+1}..${high}].`));
      mergeSort(low, mid);
      mergeSort(mid + 1, high);
      merge(low, mid, high);
    }
  }

  mergeSort(0, arr.length - 1);
  steps.push(snap([], [], [], `Merge Sort complete! ${comparisons} comparisons, ${swaps} writes.`));
  return steps;
}
