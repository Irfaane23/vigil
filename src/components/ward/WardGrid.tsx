import { useMemo } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import type { Patient } from "@/types/patient";
import { AlarmTier } from "@/types/vitals";
import { WardCard } from "./WardCard";
import { WardSort } from "./wardSort";
import styles from "./WardGrid.module.css";

const TIER_RANK: Record<AlarmTier, number> = {
  NORMAL: 0,
  ADVISORY: 1,
  URGENT: 2,
  EMERGENCY: 3,
};

interface PatientSummary {
  patient: Patient;
  worstTier: AlarmTier;
  alarmCount: number;
}

function compareForSort(sort: WardSort, a: PatientSummary, b: PatientSummary): number {
  if (sort === WardSort.BED_ASC) {
    return a.patient.bedNumber.localeCompare(b.patient.bedNumber);
  }
  if (sort === WardSort.NAME_ASC) {
    return a.patient.name.localeCompare(b.patient.name);
  }
  // SEVERITY_DESC: highest tier first, then by alarm count desc, then by bed asc.
  const tierDelta = TIER_RANK[b.worstTier] - TIER_RANK[a.worstTier];
  if (tierDelta !== 0) return tierDelta;
  const countDelta = b.alarmCount - a.alarmCount;
  if (countDelta !== 0) return countDelta;
  return a.patient.bedNumber.localeCompare(b.patient.bedNumber);
}

interface WardGridProps {
  patients: readonly Patient[];
  sort: WardSort;
}

export function WardGrid({ patients, sort }: WardGridProps) {
  const activeAlarms = useAlarmStore((s) => s.activeAlarms);

  const sortedSummaries = useMemo(() => {
    const summaries: PatientSummary[] = patients.map((patient) => {
      const patientAlarms = Object.values(activeAlarms).filter(
        (a) => a.patientId === patient.id && a.tier !== AlarmTier.NORMAL,
      );
      let worstTier: AlarmTier = AlarmTier.NORMAL;
      for (const alarm of patientAlarms) {
        if (TIER_RANK[alarm.tier] > TIER_RANK[worstTier]) worstTier = alarm.tier;
      }
      return { patient, worstTier, alarmCount: patientAlarms.length };
    });
    return [...summaries].sort((a, b) => compareForSort(sort, a, b));
  }, [patients, activeAlarms, sort]);

  if (sortedSummaries.length === 0) {
    return <p className={styles.empty}>No patients on the ward.</p>;
  }

  return (
    <div className={styles.grid}>
      {sortedSummaries.map(({ patient }) => (
        <WardCard key={patient.id} patientId={patient.id} />
      ))}
    </div>
  );
}
