import { type WardSort, WARD_SORT_OPTIONS } from "./wardSort";
import styles from "./WardToolbar.module.css";

interface WardToolbarProps {
  sort: WardSort;
  onSortChange: (sort: WardSort) => void;
}

export function WardToolbar({ sort, onSortChange }: WardToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <span className={styles.label} id="ward-sort-label">
        Sort by
      </span>
      <div className={styles.options} role="radiogroup" aria-labelledby="ward-sort-label">
        {WARD_SORT_OPTIONS.map((opt) => {
          const isActive = opt.value === sort;
          const cls = [styles.option, isActive ? styles.active : ""].filter(Boolean).join(" ");
          return (
            <button
              key={opt.value}
              type="button"
              className={cls}
              role="radio"
              aria-checked={isActive}
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
