import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { AlarmThreshold } from "@/types/alarm";
import type { Annotation } from "@/types/annotation";
import { AlarmTier, type VitalCode, type VitalReading } from "@/types/vitals";
import { formatValue, getUnit } from "@/utils/formatVital";
import styles from "./TrendChart.module.css";

const ANNOTATION_LABEL_MAX = 18;

const MIN_DRAG_PX = 20;

interface ChartMouseState {
  activeLabel?: string | number;
  chartX?: number;
}

interface DragPoint {
  time: number;
  px: number;
}

const TIER_COLOR: Record<AlarmTier, string> = {
  NORMAL: "var(--color-text-primary)",
  ADVISORY: "var(--color-alarm-advisory)",
  URGENT: "var(--color-alarm-urgent)",
  EMERGENCY: "var(--color-alarm-emergency)",
};

const TIER_FILL: Record<"advisory" | "urgent" | "emergency", string> = {
  advisory: "var(--color-alarm-advisory-tint)",
  urgent: "var(--color-alarm-urgent-tint)",
  emergency: "var(--color-alarm-emergency-tint)",
};

interface ChartPoint {
  t: number;
  v: number;
}

function formatTime(ms: number): string {
  const date = new Date(ms);
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function computeYDomain(data: ChartPoint[], threshold: AlarmThreshold): [number, number] {
  const values = data.map((d) => d.v);
  const min = Math.min(threshold.advisoryLow, ...values);
  const max = Math.max(threshold.advisoryHigh, ...values);
  const padding = Math.max((max - min) * 0.1, 1);
  return [Math.floor(min - padding), Math.ceil(max + padding)];
}

interface TrendChartProps {
  readings: VitalReading[];
  threshold: AlarmThreshold;
  alarmTier: AlarmTier;
  code: VitalCode;
  windowStart: number;
  windowEnd: number;
  annotations?: Annotation[];
  onZoomRange?: (start: number, end: number) => void;
}

export function TrendChart({
  readings,
  threshold,
  alarmTier,
  code,
  windowStart,
  windowEnd,
  annotations = [],
  onZoomRange,
}: TrendChartProps) {
  const [dragStart, setDragStart] = useState<DragPoint | null>(null);
  const [dragEnd, setDragEnd] = useState<DragPoint | null>(null);

  if (readings.length < 2) {
    return <div className={styles.empty}>Not enough data to plot.</div>;
  }

  const data: ChartPoint[] = readings.map((r) => ({
    t: new Date(r.timestamp).getTime(),
    v: r.value,
  }));

  const [yMin, yMax] = computeYDomain(data, threshold);
  const lineColor = TIER_COLOR[alarmTier];
  const unit = getUnit(code);

  function handleMouseDown(state: ChartMouseState | null) {
    if (state?.activeLabel != null && state.chartX != null) {
      const time = Number(state.activeLabel);
      const px = state.chartX;
      setDragStart({ time, px });
      setDragEnd({ time, px });
    }
  }

  function handleMouseMove(state: ChartMouseState | null) {
    if (dragStart === null || state?.activeLabel == null || state.chartX == null) return;
    setDragEnd({ time: Number(state.activeLabel), px: state.chartX });
  }

  function clearDrag() {
    setDragStart(null);
    setDragEnd(null);
  }

  function handleMouseUp() {
    if (dragStart !== null && dragEnd !== null && onZoomRange) {
      const widthPx = Math.abs(dragEnd.px - dragStart.px);
      if (widthPx >= MIN_DRAG_PX) {
        const a = Math.min(dragStart.time, dragEnd.time);
        const b = Math.max(dragStart.time, dragEnd.time);
        if (a < b) onZoomRange(a, b);
      }
    }
    clearDrag();
  }

  const isDragging = dragStart !== null;
  const chartClass = [styles.chart, isDragging ? styles.dragging : ""].filter(Boolean).join(" ");

  return (
    <div className={chartClass}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={clearDrag}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="t"
            type="number"
            domain={[windowStart, windowEnd]}
            tickFormatter={formatTime}
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickCount={6}
          />
          <YAxis
            domain={[yMin, yMax]}
            stroke="var(--color-text-muted)"
            fontSize={11}
            width={40}
            tickFormatter={(v: number) => formatValue(code, v)}
          />

          {/* Emergency bands */}
          <ReferenceArea
            y1={yMin}
            y2={threshold.emergencyLow}
            fill={TIER_FILL.emergency}
            fillOpacity={0.6}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={threshold.emergencyHigh}
            y2={yMax}
            fill={TIER_FILL.emergency}
            fillOpacity={0.6}
            ifOverflow="visible"
          />
          {/* Urgent bands */}
          <ReferenceArea
            y1={threshold.emergencyLow}
            y2={threshold.urgentLow}
            fill={TIER_FILL.urgent}
            fillOpacity={0.6}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={threshold.urgentHigh}
            y2={threshold.emergencyHigh}
            fill={TIER_FILL.urgent}
            fillOpacity={0.6}
            ifOverflow="visible"
          />
          {/* Advisory bands */}
          <ReferenceArea
            y1={threshold.urgentLow}
            y2={threshold.advisoryLow}
            fill={TIER_FILL.advisory}
            fillOpacity={0.6}
            ifOverflow="visible"
          />
          <ReferenceArea
            y1={threshold.advisoryHigh}
            y2={threshold.urgentHigh}
            fill={TIER_FILL.advisory}
            fillOpacity={0.6}
            ifOverflow="visible"
          />

          {/* Threshold boundary lines */}
          <ReferenceLine
            y={threshold.emergencyHigh}
            stroke="var(--color-alarm-emergency)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.emergencyHigh)}${unit ? ` ${unit}` : ""}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />
          <ReferenceLine
            y={threshold.urgentHigh}
            stroke="var(--color-alarm-urgent)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.urgentHigh)}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />
          <ReferenceLine
            y={threshold.advisoryHigh}
            stroke="var(--color-alarm-advisory)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.advisoryHigh)}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />
          <ReferenceLine
            y={threshold.advisoryLow}
            stroke="var(--color-alarm-advisory)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.advisoryLow)}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />
          <ReferenceLine
            y={threshold.urgentLow}
            stroke="var(--color-alarm-urgent)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.urgentLow)}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />
          <ReferenceLine
            y={threshold.emergencyLow}
            stroke="var(--color-alarm-emergency)"
            strokeDasharray="4 3"
            label={{
              value: `${formatValue(code, threshold.emergencyLow)}${unit ? ` ${unit}` : ""}`,
              position: "right",
              className: styles.thresholdLabel,
            }}
          />

          <Line
            type="monotone"
            dataKey="v"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {annotations
            .filter((a) => {
              const t = new Date(a.timestamp).getTime();
              return t >= windowStart && t <= windowEnd;
            })
            .map((a) => {
              const t = new Date(a.timestamp).getTime();
              const text =
                a.text.length > ANNOTATION_LABEL_MAX
                  ? `${a.text.slice(0, ANNOTATION_LABEL_MAX - 1)}…`
                  : a.text;
              return (
                <ReferenceLine
                  key={a.id}
                  x={t}
                  stroke="var(--color-text-primary)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                  label={{
                    value: text,
                    position: "top",
                    className: styles.annotationLabel,
                    fill: "var(--color-text-primary)",
                  }}
                />
              );
            })}
          {annotations
            .filter((a) => {
              const t = new Date(a.timestamp).getTime();
              return t >= windowStart && t <= windowEnd;
            })
            .map((a) => {
              const t = new Date(a.timestamp).getTime();
              return (
                <ReferenceDot
                  key={`${a.id}-dot`}
                  x={t}
                  y={yMax}
                  r={4}
                  fill="var(--color-focus)"
                  stroke="var(--color-surface)"
                  strokeWidth={1.5}
                  ifOverflow="visible"
                />
              );
            })}

          {dragStart !== null && dragEnd !== null && dragStart.time !== dragEnd.time && (
            <ReferenceArea
              x1={Math.min(dragStart.time, dragEnd.time)}
              x2={Math.max(dragStart.time, dragEnd.time)}
              fill="rgb(59, 130, 246)"
              fillOpacity={0.2}
              stroke="rgb(59, 130, 246)"
              strokeOpacity={0.6}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
