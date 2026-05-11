import type { PatientVitalsMap } from "@/hooks/usePatientVitals";
import { VitalTile } from "@/components/vitals/VitalTile";
import type { VitalCode } from "@/types/vitals";
import styles from "./DomainGroup.module.css";

interface DomainGroupProps {
  label: string;
  codes: VitalCode[];
  vitals: PatientVitalsMap;
  activeTile: VitalCode | null;
  onTileClick: (code: VitalCode) => void;
}

export function DomainGroup({ label, codes, vitals, activeTile, onTileClick }: DomainGroupProps) {
  const panelCode = codes.find((c) => c === activeTile) ?? null;

  return (
    <section className={styles.section}>
      <h2 className={styles.label}>{label}</h2>
      <div className={styles.grid}>
        {codes.map((code) => {
          const data = vitals[code];
          return (
            <VitalTile
              key={code}
              code={code}
              reading={data.reading}
              history={data.history}
              alarmTier={data.alarmTier}
              isStale={data.isStale}
              isCalculated={data.isCalculated}
              isActive={activeTile === code}
              onClick={() => onTileClick(code)}
            />
          );
        })}
      </div>
      {panelCode !== null && (
        <div className={styles.panelSlot} role="region" aria-label={`Trend panel for ${panelCode}`}>
          {/* TrendPanel — wired in VIGIL-009 */}
        </div>
      )}
    </section>
  );
}
