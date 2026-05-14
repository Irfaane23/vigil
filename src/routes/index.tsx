import { createFileRoute, Link } from "@tanstack/react-router";
import { MOCK_PATIENTS } from "@/config";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return (
    <main className={styles.landing}>
      <div>
        <h1 className={styles.title}>vigil</h1>
        <p className={styles.subtitle}>
          Real-time ICU vital signs monitoring — start the mock stream with <code>pnpm mock</code>,
          then open one of the views below.
        </p>
      </div>

      <section className={styles.section}>
        <span className={styles.label}>Ward</span>
        <ul className={styles.linkList}>
          <li>
            <Link to="/ward" className={styles.link}>
              Ward overview
            </Link>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <span className={styles.label}>Bedside</span>
        <ul className={styles.linkList}>
          {MOCK_PATIENTS.map((p) => (
            <li key={p.id}>
              <Link to="/bedside/$patientId" params={{ patientId: p.id }} className={styles.link}>
                {p.bedNumber} — {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
