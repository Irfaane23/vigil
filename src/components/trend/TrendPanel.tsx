import { useState } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { useVitalsStore } from "@/store/vitalsStore";
import type { AlarmTier, VitalCode } from "@/types/vitals";
import { AnnotationLog } from "./AnnotationLog";
import { TrendChart } from "./TrendChart";
import { TimeWindowSelector } from "./TimeWindowSelector";
import { DEFAULT_WINDOW_MINUTES } from "./timeWindows";
import styles from "./TrendPanel.module.css";

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

interface ZoomRange {
  start: number;
  end: number;
}

const MAX_ZOOM_DEPTH = 10;

interface TrendPanelProps {
  patientId: string;
  code: VitalCode;
  alarmTier: AlarmTier;
  onClose: () => void;
}

export function TrendPanel({ patientId, code, alarmTier, onClose }: TrendPanelProps) {
  const tierClass = styles[alarmTier.toLowerCase() as Lowercase<AlarmTier>] ?? "";
  const panelClass = [styles.panel, tierClass].filter(Boolean).join(" ");

  const allReadings = useVitalsStore((s) => s.readings[patientId]?.[code]);
  const getThreshold = useAlarmStore((s) => s.getThreshold);
  const threshold = getThreshold(patientId, code);
  const annotations = useAnnotationStore((s) => s.annotations[patientId] ?? []);

  const [windowMinutes, setWindowMinutes] = useState<number>(DEFAULT_WINDOW_MINUTES);
  const [zoomStack, setZoomStack] = useState<(ZoomRange | null)[]>([]);
  const [currentZoom, setCurrentZoom] = useState<ZoomRange | null>(null);

  function handleWindowChange(minutes: number) {
    setWindowMinutes(minutes);
    setZoomStack([]);
    setCurrentZoom(null);
  }

  function handleZoomRange(start: number, end: number) {
    setZoomStack((stack) => [...stack, currentZoom].slice(-MAX_ZOOM_DEPTH));
    setCurrentZoom({ start, end });
  }

  function handlePreviousZoom() {
    setZoomStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack.slice(0, -1);
      const popped = stack[stack.length - 1];
      setCurrentZoom(popped);
      return next;
    });
  }

  function handleResetZoom() {
    setZoomStack([]);
    setCurrentZoom(null);
    setWindowMinutes(DEFAULT_WINDOW_MINUTES);
  }

  const now = Date.now();
  const defaultEnd = now;
  const defaultStart = now - windowMinutes * 60 * 1000;
  const windowEnd = currentZoom?.end ?? defaultEnd;
  const windowStart = currentZoom?.start ?? defaultStart;

  const isZoomed = currentZoom !== null;
  const canPrevious = zoomStack.length > 0;
  const canReset = isZoomed;

  const defaultRangeMs = windowMinutes * 60 * 1000;
  const currentRangeMs = windowEnd - windowStart;
  const zoomPercent = Math.max(1, Math.round((currentRangeMs / defaultRangeMs) * 100));
  const zoomStateText = isZoomed
    ? `Zoomed — ${zoomPercent}% of range`
    : "Drag to select a time range and zoom in";
  const zoomStateClass = [styles.zoomState, isZoomed ? styles.zoomed : ""]
    .filter(Boolean)
    .join(" ");

  const readingsInWindow = (allReadings ?? []).filter((r) => {
    const t = new Date(r.timestamp).getTime();
    return t >= windowStart && t <= windowEnd;
  });

  return (
    <section
      className={panelClass}
      aria-label={`Trend panel for ${VITAL_LABEL[code]}`}
      data-patient-id={patientId}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>
          {VITAL_LABEL[code]}
          <span className={styles.subtitle}>Trend</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close trend panel"
        >
          ×
        </button>
      </header>
      <div className={styles.body}>
        <div className={styles.controls}>
          <TimeWindowSelector value={windowMinutes} onChange={handleWindowChange} />
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={handlePreviousZoom}
            disabled={!canPrevious}
          >
            ← Previous
          </button>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={handleResetZoom}
            disabled={!canReset}
          >
            Reset to 1h
          </button>
          <span className={zoomStateClass} role="status" aria-live="polite">
            {zoomStateText}
          </span>
        </div>
        <TrendChart
          readings={readingsInWindow}
          threshold={threshold}
          alarmTier={alarmTier}
          code={code}
          windowStart={windowStart}
          windowEnd={windowEnd}
          annotations={annotations}
          onZoomRange={handleZoomRange}
        />
        <AnnotationLog patientId={patientId} />
      </div>
    </section>
  );
}
