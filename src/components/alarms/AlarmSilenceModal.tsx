import { useState } from "react";
import type { Alarm } from "@/types/alarm";
import type { VitalCode } from "@/types/vitals";
import styles from "./AlarmSilenceModal.module.css";

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

const DURATIONS: readonly number[] = [2, 5, 15];

interface AlarmSilenceModalProps {
  alarm: Alarm;
  onCancel: () => void;
  onConfirm: (durationMinutes: number) => void;
}

export function AlarmSilenceModal({ alarm, onCancel, onConfirm }: AlarmSilenceModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const titleId = `alarm-silence-title-${alarm.id}`;
  const subtitleId = `alarm-silence-subtitle-${alarm.id}`;

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  function handleConfirm() {
    if (selected !== null) onConfirm(selected);
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div className={styles.modal}>
        <div>
          <h2 id={titleId} className={styles.title}>
            Silence {VITAL_LABEL[alarm.vitalCode]} alarm
          </h2>
          <p id={subtitleId} className={styles.subtitle}>
            Choose how long to silence this {alarm.tier.toLowerCase()} alarm.
          </p>
        </div>

        <div className={styles.durations} role="radiogroup" aria-label="Silence duration">
          {DURATIONS.map((minutes) => {
            const isSelected = selected === minutes;
            const btnClass = [styles.durationBtn, isSelected ? styles.selected : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={minutes}
                type="button"
                className={btnClass}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(minutes)}
              >
                <span>{minutes}</span>
                <span className={styles.durationLabel}>min</span>
              </button>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          {selected !== null && (
            <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
              Confirm silence ({selected} min)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
