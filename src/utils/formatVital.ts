import { VitalCode } from "@/types/vitals";

export function formatValue(code: VitalCode, value: number): string {
  if (code === VitalCode.TEMP) return value.toFixed(1);
  return Math.round(value).toString();
}

export function getUnit(code: VitalCode): string {
  const units: Record<VitalCode, string> = {
    [VitalCode.HR]: "bpm",
    [VitalCode.SPO2]: "%",
    [VitalCode.SBP]: "mmHg",
    [VitalCode.DBP]: "mmHg",
    [VitalCode.MAP]: "mmHg",
    [VitalCode.RR]: "br/min",
    [VitalCode.TEMP]: "°C",
    [VitalCode.GCS]: "",
  };
  return units[code];
}
