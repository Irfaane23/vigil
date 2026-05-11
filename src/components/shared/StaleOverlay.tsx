import styles from "./StaleOverlay.module.css";

interface StaleOverlayProps {
  label?: string;
}

export function StaleOverlay({ label = "STALE" }: StaleOverlayProps) {
  return (
    <span className={styles.overlay} aria-label="Data is stale">
      <span className={styles.label}>{label}</span>
    </span>
  );
}
