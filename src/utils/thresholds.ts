import type { AlarmThreshold } from "@/types/alarm";
import { AlarmTier, VitalCode } from "@/types/vitals";

export const DEFAULT_THRESHOLDS: Record<VitalCode, AlarmThreshold> = {
  [VitalCode.HR]: {
    vitalCode: VitalCode.HR,
    advisoryLow: 50,
    advisoryHigh: 120,
    urgentLow: 40,
    urgentHigh: 150,
    emergencyLow: 20,
    emergencyHigh: 180,
  },
  [VitalCode.SPO2]: {
    vitalCode: VitalCode.SPO2,
    advisoryLow: 92,
    advisoryHigh: 101,
    urgentLow: 88,
    urgentHigh: 101,
    emergencyLow: 80,
    emergencyHigh: 101,
  },
  [VitalCode.SBP]: {
    vitalCode: VitalCode.SBP,
    advisoryLow: 85,
    advisoryHigh: 160,
    urgentLow: 75,
    urgentHigh: 180,
    emergencyLow: 60,
    emergencyHigh: 220,
  },
  [VitalCode.DBP]: {
    vitalCode: VitalCode.DBP,
    advisoryLow: 50,
    advisoryHigh: 100,
    urgentLow: 40,
    urgentHigh: 110,
    emergencyLow: 30,
    emergencyHigh: 130,
  },
  [VitalCode.MAP]: {
    vitalCode: VitalCode.MAP,
    advisoryLow: 65,
    advisoryHigh: 110,
    urgentLow: 55,
    urgentHigh: 125,
    emergencyLow: 45,
    emergencyHigh: 140,
  },
  [VitalCode.RR]: {
    vitalCode: VitalCode.RR,
    advisoryLow: 10,
    advisoryHigh: 24,
    urgentLow: 8,
    urgentHigh: 28,
    emergencyLow: 6,
    emergencyHigh: 35,
  },
  [VitalCode.TEMP]: {
    vitalCode: VitalCode.TEMP,
    advisoryLow: 35.5,
    advisoryHigh: 38.5,
    urgentLow: 35.0,
    urgentHigh: 39.5,
    emergencyLow: 34.0,
    emergencyHigh: 41.0,
  },
  [VitalCode.GCS]: {
    vitalCode: VitalCode.GCS,
    advisoryLow: 14,
    advisoryHigh: 16,
    urgentLow: 12,
    urgentHigh: 16,
    emergencyLow: 8,
    emergencyHigh: 16,
  },
};

export function evaluateThreshold(value: number, threshold: AlarmThreshold): AlarmTier {
  if (value <= threshold.emergencyLow || value >= threshold.emergencyHigh) {
    return AlarmTier.EMERGENCY;
  }
  if (value <= threshold.urgentLow || value >= threshold.urgentHigh) {
    return AlarmTier.URGENT;
  }
  if (value <= threshold.advisoryLow || value >= threshold.advisoryHigh) {
    return AlarmTier.ADVISORY;
  }
  return AlarmTier.NORMAL;
}
