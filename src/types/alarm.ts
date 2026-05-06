import type { AlarmTier, VitalCode } from "./vitals";

export interface AlarmThreshold {
  readonly vitalCode: VitalCode;
  readonly advisoryLow: number;
  readonly advisoryHigh: number;
  readonly urgentLow: number;
  readonly urgentHigh: number;
  readonly emergencyLow: number;
  readonly emergencyHigh: number;
}

export interface Alarm {
  readonly id: string;
  readonly patientId: string;
  readonly vitalCode: VitalCode;
  readonly tier: AlarmTier;
  readonly triggeredAt: string;
  readonly currentValue: number;
}

export interface SilenceRecord {
  readonly alarmId: string;
  readonly silencedAt: string;
  readonly expiresAt: string;
  readonly durationMinutes: number;
}
