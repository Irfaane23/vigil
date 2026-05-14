/**
 * Single-instance, multi-patient stores.
 *
 * All three Zustand stores key their state by `patientId` so the entire ICU
 * (every concurrent stream) lives in one store of each kind. The bedside
 * view selects against one patient; the ward view selects across all of
 * them, both read from the same source of truth, hydrated by a single
 * `useVitalsStream` connection.
 *
 * Composite keys used:
 *   activeAlarms[`${patientId}:${vitalCode}`]
 *   silenceRecords[`${patientId}:${vitalCode}`]
 */

export { useVitalsStore } from "./vitalsStore";
export { useAlarmStore } from "./alarmStore";
export { useAnnotationStore } from "./annotationStore";
