export function getAverage(entries: Array<number>): number {
  return entries.reduce((sum, entry) => sum + entry, 0) / entries.length;
}

export function findInArray<T>(
  array: Array<T>,
  valueGetter: (a: T, idx: number) => number = (a: T) => a as any,
  checkFunc: (a: number, b: number, idx: number) => number = (a, b) => a - b,
): [element: T, idx: number, foundValue: number] {
  if (array.length === 0) return [null, -1, 0];

  let found = valueGetter(array[0], 0);
  let foundIdx = 0;

  for (let i = 1; i < array.length; i++) {
    const value = valueGetter(array[i], i);

    if (checkFunc(found, value, i) > 0) {
      found = value;
      foundIdx = i;
    }
  }

  return [array[foundIdx], foundIdx, found];
}