import { useState } from "react";
import { MOCK_PATIENTS } from "@/config";
import { useAlarmStore } from "@/store/alarmStore";
import { AlarmTier } from "@/types/vitals";
import { WardGrid } from "./WardGrid";
import { WardToolbar } from "./WardToolbar";
import { DEFAULT_WARD_SORT, type WardSort } from "./wardSort";
import styles from "./WardView.module.css";

export function WardView() {
  const [sort, setSort] = useState<WardSort>(DEFAULT_WARD_SORT);
  const activeAlarms = useAlarmStore((s) => s.activeAlarms);

  const totalAlarms = Object.values(activeAlarms).filter((a) => a.tier !== AlarmTier.NORMAL).length;
  const totalPatients = MOCK_PATIENTS.length;

  return (
    <main className={styles.view}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Ward overview</h1>
          <div className={styles.counts} aria-label="Ward summary">
            <span className={styles.patientCount} aria-label={`${totalPatients} patients`}>
              <strong>{totalPatients}</strong> patients
            </span>
            {totalAlarms > 0 && (
              <span
                className={styles.alarmPill}
                aria-label={`${totalAlarms} active alarms`}
                role="status"
              >
                <span className={styles.alarmPillCount}>{totalAlarms}</span>
                <span>active alarm{totalAlarms === 1 ? "" : "s"}</span>
              </span>
            )}
          </div>
        </div>
        <WardToolbar sort={sort} onSortChange={setSort} />
      </header>
      <WardGrid patients={MOCK_PATIENTS} sort={sort} />
    </main>
  );
}
