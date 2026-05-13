import { useState } from "react";
import { AlarmBanner } from "@/components/alarms/AlarmBanner";
import { usePatientVitals } from "@/hooks/usePatientVitals";
import { DomainGroup } from "./DomainGroup";
import { PatientHeader } from "./PatientHeader";
import type { VitalCode } from "@/types/vitals";
import { VitalCode as VC } from "@/types/vitals";
import styles from "./BedsideLayout.module.css";

interface DomainSpec {
  label: string;
  codes: VitalCode[];
}

const DOMAIN_ORDER: DomainSpec[] = [
  { label: "Hemodynamic", codes: [VC.HR, VC.SBP, VC.DBP, VC.MAP] },
  { label: "Respiratory", codes: [VC.RR, VC.SPO2] },
  { label: "Neurological", codes: [VC.GCS] },
  { label: "Metabolic", codes: [VC.TEMP] },
];

interface BedsideLayoutProps {
  patientId: string;
}

export function BedsideLayout({ patientId }: BedsideLayoutProps) {
  const { vitals, connectionStatus, patient } = usePatientVitals(patientId);
  const [activeTile, setActiveTile] = useState<VitalCode | null>(null);

  function handleTileClick(code: VitalCode) {
    setActiveTile((prev) => (prev === code ? null : code));
  }

  function handlePanelClose() {
    setActiveTile(null);
  }

  if (patient === undefined) {
    return (
      <main className={styles.layout}>
        <p className={styles.notFound}>Patient {patientId} not found.</p>
      </main>
    );
  }

  return (
    <main className={styles.layout}>
      <PatientHeader patient={patient} connectionStatus={connectionStatus} />
      <AlarmBanner patientId={patientId} />
      <div className={styles.domains}>
        {DOMAIN_ORDER.map(({ label, codes }) => (
          <DomainGroup
            key={label}
            label={label}
            codes={codes}
            vitals={vitals}
            patientId={patientId}
            activeTile={activeTile}
            onTileClick={handleTileClick}
            onPanelClose={handlePanelClose}
          />
        ))}
      </div>
    </main>
  );
}
