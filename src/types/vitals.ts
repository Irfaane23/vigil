export const VitalCode = {
  HR: "HR",
  SPO2: "SPO2",
  SBP: "SBP",
  DBP: "DBP",
  MAP: "MAP",
  RR: "RR",
  TEMP: "TEMP",
  GCS: "GCS",
} as const;

export type VitalCode = (typeof VitalCode)[keyof typeof VitalCode];

export const DomainGroup = {
  HEMODYNAMIC: "HEMODYNAMIC",
  RESPIRATORY: "RESPIRATORY",
  NEUROLOGICAL: "NEUROLOGICAL",
  METABOLIC: "METABOLIC",
} as const;

export type DomainGroup = (typeof DomainGroup)[keyof typeof DomainGroup];

export const AlarmTier = {
  NORMAL: "NORMAL",
  ADVISORY: "ADVISORY",
  URGENT: "URGENT",
  EMERGENCY: "EMERGENCY",
} as const;

export type AlarmTier = (typeof AlarmTier)[keyof typeof AlarmTier];

export const ConnectionStatus = {
  LIVE: "LIVE",
  STALE: "STALE",
  RECONNECTING: "RECONNECTING",
  DISCONNECTED: "DISCONNECTED",
} as const;

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export interface VitalReading {
  readonly patientId: string;
  readonly code: VitalCode;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: string;
  readonly isCalculated: boolean;
}

export const DOMAIN_MAP: Record<VitalCode, DomainGroup> = {
  [VitalCode.HR]: DomainGroup.HEMODYNAMIC,
  [VitalCode.SBP]: DomainGroup.HEMODYNAMIC,
  [VitalCode.DBP]: DomainGroup.HEMODYNAMIC,
  [VitalCode.MAP]: DomainGroup.HEMODYNAMIC,
  [VitalCode.RR]: DomainGroup.RESPIRATORY,
  [VitalCode.SPO2]: DomainGroup.RESPIRATORY,
  [VitalCode.GCS]: DomainGroup.NEUROLOGICAL,
  [VitalCode.TEMP]: DomainGroup.METABOLIC,
};
