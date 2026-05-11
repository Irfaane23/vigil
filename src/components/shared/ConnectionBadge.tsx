import type { ConnectionStatus } from "@/types/vitals";
import styles from "./ConnectionBadge.module.css";

const BADGE_LABEL: Record<ConnectionStatus, string> = {
  LIVE: "Live",
  STALE: "Stale",
  RECONNECTING: "Reconnecting...",
  DISCONNECTED: "Disconnected",
};

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const statusClass = status.toLowerCase() as Lowercase<ConnectionStatus>;
  return (
    <span className={`${styles.badge} ${styles[statusClass]}`} role="status" aria-live="polite">
      <span className={styles.dot} aria-hidden="true" />
      {BADGE_LABEL[status]}
    </span>
  );
}
