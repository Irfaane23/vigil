import type { VitalReading } from "@/types/vitals";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparkLineProps {
  history: VitalReading[];
}

export function SparkLine({ history }: SparkLineProps) {
  if (history.length < 2) return null;

  const data = history.slice(-60).map((r) => ({ v: r.value }));

  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          dot={false}
          isAnimationActive={false}
          stroke="currentColor"
          strokeWidth={1.5}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
