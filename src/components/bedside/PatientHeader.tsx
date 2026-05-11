import type { Patient } from "@/types/patient";
import type { ConnectionStatus } from "@/types/vitals";
import { ConnectionBadge } from "@/components/shared/ConnectionBadge";
import styles from "./PatientHeader.module.css";

function formatAdmitted(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PatientHeaderProps {
  patient: Patient;
  connectionStatus: ConnectionStatus;
}

export function PatientHeader({ patient, connectionStatus }: PatientHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        <div className={styles.identity}>
          <span className={styles.bed}>{patient.bedNumber}</span>
          <h1 className={styles.name}>{patient.name}</h1>
        </div>
        <div className={styles.actions}>
          <ConnectionBadge status={connectionStatus} />
          <button type="button" className={styles.handoffBtn} aria-label="Open handoff summary">
            Handoff summary
          </button>
        </div>
      </div>
      <p className={styles.meta}>
        <span>Admitted {formatAdmitted(patient.admittedAt)}</span>
        {patient.age !== undefined && <span>· Age {patient.age}</span>}
        {patient.mrn !== undefined && <span>· {patient.mrn}</span>}
      </p>
    </header>
  );
}
