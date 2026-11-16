type ComparableRecord = Record<string, unknown>;

function normalizeComparable(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (value && typeof value === 'object') {
    return Object.keys(value as ComparableRecord)
      .sort()
      .reduce<ComparableRecord>((result, key) => {
        const entry = (value as ComparableRecord)[key];
        if (entry !== undefined) result[key] = normalizeComparable(entry);
        return result;
      }, {});
  }
  return value;
}

export function formValuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(normalizeComparable(left)) === JSON.stringify(normalizeComparable(right));
}

export function hasFormChanges(initialValue: unknown, currentValue: unknown) {
  return !formValuesEqual(initialValue, currentValue);
}
