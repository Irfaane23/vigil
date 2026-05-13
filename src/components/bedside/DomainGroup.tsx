import type { PatientVitalsMap } from "@/hooks/usePatientVitals";
import { TrendPanel } from "@/components/trend/TrendPanel";
import { VitalTile } from "@/components/vitals/VitalTile";
import type { VitalCode } from "@/types/vitals";
import styles from "./DomainGroup.module.css";

interface DomainGroupProps {
  label: string;
  codes: VitalCode[];
  vitals: PatientVitalsMap;
  patientId: string;
  activeTile: VitalCode | null;
  onTileClick: (code: VitalCode) => void;
  onPanelClose: () => void;
}

export function DomainGroup({
  label,
  codes,
  vitals,
  patientId,
  activeTile,
  onTileClick,
  onPanelClose,
}: DomainGroupProps) {
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
        <TrendPanel
          patientId={patientId}
          code={panelCode}
          alarmTier={vitals[panelCode].alarmTier}
          onClose={onPanelClose}
        />
      )}
    </section>
  );
}
