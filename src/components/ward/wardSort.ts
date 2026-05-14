export const WardSort = {
  SEVERITY_DESC: "SEVERITY_DESC",
  BED_ASC: "BED_ASC",
  NAME_ASC: "NAME_ASC",
} as const;

export type WardSort = (typeof WardSort)[keyof typeof WardSort];

export const DEFAULT_WARD_SORT: WardSort = WardSort.SEVERITY_DESC;

export interface WardSortOption {
  readonly value: WardSort;
  readonly label: string;
}

export const WARD_SORT_OPTIONS: readonly WardSortOption[] = [
  { value: WardSort.SEVERITY_DESC, label: "Alarm severity" },
  { value: WardSort.BED_ASC, label: "Bed number" },
  { value: WardSort.NAME_ASC, label: "Patient name" },
];
