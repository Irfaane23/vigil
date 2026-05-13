import { TIME_WINDOWS } from "./timeWindows";
import styles from "./TimeWindowSelector.module.css";

interface TimeWindowSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function TimeWindowSelector({ value, onChange }: TimeWindowSelectorProps) {
  return (
    <div className={styles.selector} role="radiogroup" aria-label="Time window">
      {TIME_WINDOWS.map((opt) => {
        const isActive = opt.minutes === value;
        const cls = [styles.option, isActive ? styles.active : ""].filter(Boolean).join(" ");
        return (
          <button
            key={opt.minutes}
            type="button"
            className={cls}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.minutes)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
