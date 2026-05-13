export interface TimeWindowOption {
  readonly label: string;
  readonly minutes: number;
}

export const TIME_WINDOWS: readonly TimeWindowOption[] = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "4h", minutes: 240 },
  { label: "8h", minutes: 480 },
  { label: "12h", minutes: 720 },
];

export const DEFAULT_WINDOW_MINUTES = 60;
