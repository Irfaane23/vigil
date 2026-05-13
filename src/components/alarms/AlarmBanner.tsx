import { useState } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import type { Alarm, AlarmThreshold } from "@/types/alarm";
import { AlarmTier, type VitalCode } from "@/types/vitals";
import { formatValue, getUnit } from "@/utils/formatVital";
import { AlarmSilenceModal } from "./AlarmSilenceModal";
import styles from "./AlarmBanner.module.css";

const VITAL_LABEL: Record<VitalCode, string> = {
  HR: "Heart Rate",
  SPO2: "SpO₂",
  SBP: "Systolic BP",
  DBP: "Diastolic BP",
  MAP: "MAP",
  RR: "Resp Rate",
  TEMP: "Temperature",
  GCS: "GCS",
};

const TIER_RANK: Record<AlarmTier, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  ADVISORY: 2,
  NORMAL: 3,
};

function getBreachLimit(
  alarm: Alarm,
  threshold: AlarmThreshold,
): { op: "≥" | "≤"; limit: number } | null {
  const v = alarm.currentValue;
  if (alarm.tier === AlarmTier.EMERGENCY) {
    if (v <= threshold.emergencyLow) return { op: "≤", limit: threshold.emergencyLow };
    if (v >= threshold.emergencyHigh) return { op: "≥", limit: threshold.emergencyHigh };
  }
  if (alarm.tier === AlarmTier.URGENT) {
    if (v <= threshold.urgentLow) return { op: "≤", limit: threshold.urgentLow };
    if (v >= threshold.urgentHigh) return { op: "≥", limit: threshold.urgentHigh };
  }
  if (alarm.tier === AlarmTier.ADVISORY) {
    if (v <= threshold.advisoryLow) return { op: "≤", limit: threshold.advisoryLow };
    if (v >= threshold.advisoryHigh) return { op: "≥", limit: threshold.advisoryHigh };
  }
  return null;
}

function formatSilencedUntil(expiresAt: string): string {
  const date = new Date(expiresAt);
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

interface AlarmBannerProps {
  patientId: string;
}

export function AlarmBanner({ patientId }: AlarmBannerProps) {
  const activeAlarms = useAlarmStore((s) => s.activeAlarms);
  const silenceRecords = useAlarmStore((s) => s.silenceRecords);
  const getThreshold = useAlarmStore((s) => s.getThreshold);
  const silenceAlarm = useAlarmStore((s) => s.silenceAlarm);
  const [silencingAlarm, setSilencingAlarm] = useState<Alarm | null>(null);

  const patientPrefix = `${patientId}:`;
  const alarms = Object.values(activeAlarms)
    .filter((a) => a.patientId === patientId && a.tier !== AlarmTier.NORMAL)
    .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  if (alarms.length === 0) return null;

  function handleConfirmSilence(durationMinutes: number) {
    if (silencingAlarm === null) return;
    const alarmKey = `${silencingAlarm.patientId}:${silencingAlarm.vitalCode}`;
    silenceAlarm(alarmKey, durationMinutes);
    setSilencingAlarm(null);
  }

  return (
    <>
      <ul
        className={styles.banner}
        aria-label={`Active alarms for patient ${patientId}`}
        role="list"
      >
        {alarms.map((alarm) => {
          const alarmId = `${patientPrefix}${alarm.vitalCode}`;
          const silence = silenceRecords[alarmId];
          const isSilenced =
            silence !== undefined && new Date(silence.expiresAt).getTime() > Date.now();
          const threshold = getThreshold(patientId, alarm.vitalCode);
          const breach = getBreachLimit(alarm, threshold);
          const tierClass = styles[alarm.tier.toLowerCase() as Lowercase<AlarmTier>];
          const unit = getUnit(alarm.vitalCode);

          const rowClass = [styles.row, tierClass, isSilenced ? styles.silenced : ""]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={alarmId}>
              <button
                type="button"
                className={rowClass}
                aria-label={`Silence ${VITAL_LABEL[alarm.vitalCode]} ${alarm.tier} alarm`}
                onClick={() => setSilencingAlarm(alarm)}
              >
                <span className={`${styles.tier} ${tierClass}`}>{alarm.tier}</span>
                <span className={styles.label}>{VITAL_LABEL[alarm.vitalCode]}</span>
                <span className={styles.value}>
                  {formatValue(alarm.vitalCode, alarm.currentValue)}
                  {unit && ` ${unit}`}
                </span>
                <span className={styles.breach}>
                  {breach !== null &&
                    `${breach.op} ${formatValue(alarm.vitalCode, breach.limit)}${unit ? ` ${unit}` : ""}`}
                </span>
                {isSilenced && silence !== undefined && (
                  <span className={styles.silenceLabel}>
                    Silenced until {formatSilencedUntil(silence.expiresAt)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {silencingAlarm !== null && (
        <AlarmSilenceModal
          alarm={silencingAlarm}
          onCancel={() => setSilencingAlarm(null)}
          onConfirm={handleConfirmSilence}
        />
      )}
    </>
  );
}
