import { useNavigate } from "@tanstack/react-router";
import { usePatientVitals } from "@/hooks/usePatientVitals";
import { ConnectionBadge } from "@/components/shared/ConnectionBadge";
import { VitalTile } from "@/components/vitals/VitalTile";
import { AlarmTier, VitalCode } from "@/types/vitals";
import styles from "./WardCard.module.css";

const TIER_RANK: Record<AlarmTier, number> = {
  NORMAL: 0,
  ADVISORY: 1,
  URGENT: 2,
  EMERGENCY: 3,
};

function highestTier(tiers: AlarmTier[]): AlarmTier {
  let worst: AlarmTier = AlarmTier.NORMAL;
  for (const t of tiers) {
    if (TIER_RANK[t] > TIER_RANK[worst]) worst = t;
  }
  return worst;
}

const CARD_VITAL_ORDER: VitalCode[] = [
  VitalCode.HR,
  VitalCode.SBP,
  VitalCode.DBP,
  VitalCode.MAP,
  VitalCode.RR,
  VitalCode.SPO2,
  VitalCode.GCS,
  VitalCode.TEMP,
];

interface WardCardProps {
  patientId: string;
}

export function WardCard({ patientId }: WardCardProps) {
  const { vitals, connectionStatus, patient } = usePatientVitals(patientId);
  const navigate = useNavigate();

  if (patient === undefined) return null;

  const tiers = CARD_VITAL_ORDER.map((c) => vitals[c].alarmTier);
  const worstTier = highestTier(tiers);
  const alarmCount = tiers.filter((t) => t !== AlarmTier.NORMAL).length;
  const tierClass = styles[worstTier.toLowerCase() as Lowercase<AlarmTier>] ?? "";
  const cardClass = [styles.card, tierClass].filter(Boolean).join(" ");
  const badgeClass = [styles.alarmBadge, tierClass].filter(Boolean).join(" ");

  function openBedside() {
    void navigate({ to: "/bedside/$patientId", params: { patientId } });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openBedside();
    }
  }

  return (
    <article
      className={cardClass}
      aria-label={`Open bedside view for ${patient.name}`}
      role="link"
      tabIndex={0}
      onClick={openBedside}
      onKeyDown={handleKeyDown}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.bed}>{patient.bedNumber}</span>
          <h3 className={styles.name}>{patient.name}</h3>
        </div>
        <div className={styles.actions}>
          {alarmCount > 0 && (
            <span className={badgeClass} aria-label={`${alarmCount} active alarms`}>
              {alarmCount}
            </span>
          )}
          <ConnectionBadge status={connectionStatus} />
        </div>
      </header>
      <div className={styles.grid}>
        {CARD_VITAL_ORDER.map((code) => {
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
              compact
            />
          );
        })}
      </div>
    </article>
  );
}
