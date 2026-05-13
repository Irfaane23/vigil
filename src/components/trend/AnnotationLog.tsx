import { useState } from "react";
import { useAnnotationStore } from "@/store/annotationStore";
import styles from "./AnnotationLog.module.css";

const PRESETS: readonly string[] = [
  "Vasopressor started",
  "Position change",
  "Suctioning",
  "Procedure",
  "Family present",
  "Medication given",
];

const AUTHOR_INITIALS = "DC";

type AddMode = "closed" | "presets" | "custom";

function formatLogTime(iso: string): string {
  const date = new Date(iso);
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

interface AnnotationLogProps {
  patientId: string;
}

export function AnnotationLog({ patientId }: AnnotationLogProps) {
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const annotations = useAnnotationStore((s) => s.annotations[patientId] ?? []);
  const [mode, setMode] = useState<AddMode>("closed");
  const [customText, setCustomText] = useState("");

  function save(text: string) {
    addAnnotation({
      patientId,
      timestamp: new Date().toISOString(),
      text,
      author: AUTHOR_INITIALS,
    });
    setMode("closed");
    setCustomText("");
  }

  function handlePreset(text: string) {
    save(text);
  }

  function handleCustomSave() {
    const trimmed = customText.trim();
    if (trimmed.length === 0) return;
    save(trimmed);
  }

  return (
    <section className={styles.section} aria-label="Annotations">
      <div className={styles.header}>
        <h4 className={styles.title}>Annotations</h4>
        {mode === "closed" && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setMode("presets")}
            aria-expanded={false}
          >
            + Add
          </button>
        )}
      </div>

      {mode === "presets" && (
        <div className={styles.presets} role="group" aria-label="Annotation presets">
          {PRESETS.map((text) => (
            <button
              key={text}
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset(text)}
            >
              {text}
            </button>
          ))}
          <button type="button" className={styles.presetBtn} onClick={() => setMode("custom")}>
            Custom…
          </button>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setMode("closed")}
            aria-label="Cancel adding annotation"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === "custom" && (
        <div className={styles.customRow}>
          <input
            type="text"
            className={styles.customInput}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Describe event…"
            aria-label="Custom annotation text"
            autoFocus
          />
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleCustomSave}
            disabled={customText.trim().length === 0}
          >
            Save
          </button>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => {
              setMode("presets");
              setCustomText("");
            }}
          >
            Back
          </button>
        </div>
      )}

      {annotations.length === 0 ? (
        <p className={styles.empty}>No annotations yet.</p>
      ) : (
        <ul className={styles.log} aria-label="Annotation log">
          {annotations.map((a) => (
            <li key={a.id} className={styles.logEntry}>
              <span className={styles.logTime}>{formatLogTime(a.timestamp)}</span>
              <span className={styles.logText}>{a.text}</span>
              <span className={styles.logAuthor}>{a.author}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
