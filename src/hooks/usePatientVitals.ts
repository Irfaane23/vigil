import { useAlarmStore } from "@/store/alarmStore";
import { useVitalsStore } from "@/store/vitalsStore";
import type { Patient } from "@/types/patient";
import { AlarmTier, ConnectionStatus, VitalCode, type VitalReading } from "@/types/vitals";
import { isStale } from "@/utils/vitalMath";

const STALE_THRESHOLD_MS = 90_000;
const HISTORY_POINTS = 60;

export interface PatientVitalData {
  reading: VitalReading | undefined;
  history: VitalReading[];
  alarmTier: AlarmTier;
  isStale: boolean;
  isCalculated: boolean;
}

export type PatientVitalsMap = Record<VitalCode, PatientVitalData>;

export interface UsePatientVitalsResult {
  vitals: PatientVitalsMap;
  connectionStatus: ConnectionStatus;
  patient: Patient | undefined;
}

const ALL_CODES = Object.values(VitalCode) as VitalCode[];

export function usePatientVitals(patientId: string): UsePatientVitalsResult {
  const session = useVitalsStore((s) => s.patients[patientId]);
  const patientReadings = useVitalsStore((s) => s.readings[patientId]);
  const activeAlarms = useAlarmStore((s) => s.activeAlarms);

  const patientIsStale =
    session?.lastMessageAt !== undefined
      ? isStale(session.lastMessageAt, STALE_THRESHOLD_MS)
      : false;

  const partialVitals: Partial<PatientVitalsMap> = {};
  for (const code of ALL_CODES) {
    const buf = patientReadings?.[code] ?? [];
    const reading = buf.length > 0 ? buf[buf.length - 1] : undefined;
    const history = buf.slice(-HISTORY_POINTS);
    const alarm = activeAlarms[`${patientId}:${code}`];
    const alarmTier = alarm?.tier ?? AlarmTier.NORMAL;
    const isCalculated = code === VitalCode.MAP;
    partialVitals[code] = { reading, history, alarmTier, isStale: patientIsStale, isCalculated };
  }

  return {
    vitals: partialVitals as PatientVitalsMap,
    connectionStatus: session?.connectionStatus ?? ConnectionStatus.DISCONNECTED,
    patient: session?.patient,
  };
}
