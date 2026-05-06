import type { VitalCode } from "./vitals";

export interface Annotation {
  readonly id: string;
  readonly patientId: string;
  readonly timestamp: string;
  readonly text: string;
  readonly author: string;
  readonly vitalCode?: VitalCode;
}
