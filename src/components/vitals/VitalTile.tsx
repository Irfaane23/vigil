import type { AlarmTier, VitalCode, VitalReading } from "@/types/vitals";
import { StaleOverlay } from "@/components/shared/StaleOverlay";
import { formatValue, getUnit } from "@/utils/formatVital";
import { SparkLine } from "./SparkLine";
import styles from "./VitalTile.module.css";

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

export interface VitalTileProps {
  code: VitalCode;
  reading: VitalReading | undefined;
  history: VitalReading[];
  alarmTier: AlarmTier;
  isStale: boolean;
  isCalculated?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function VitalTile({
  code,
  reading,
  history,
  alarmTier,
  isStale,
  isCalculated = false,
  isActive = false,
  onClick,
  compact = false,
}: VitalTileProps) {
  const label = VITAL_LABEL[code];
  const unit = getUnit(code);
  const displayValue = reading !== undefined ? formatValue(code, reading.value) : "—";

  const tileClass = [
    styles.tile,
    styles[alarmTier.toLowerCase() as Lowercase<typeof alarmTier>],
    isActive ? styles.active : "",
    compact ? styles.compact : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={tileClass}
      onClick={onClick}
      aria-label={`${label}: ${displayValue} ${unit}${isStale ? " (stale)" : ""}`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.readingArea}>
        <span className={styles.valueRow}>
          <span className={styles.value}>{displayValue}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
          {isCalculated && <span className={styles.calcBadge}>calc</span>}
        </span>
        {!compact && (
          <span className={styles.sparkline}>
            <SparkLine history={history} />
          </span>
        )}
        {isStale && <StaleOverlay />}
      </span>
    </button>
  );
}
