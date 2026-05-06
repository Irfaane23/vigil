import { WebSocket, WebSocketServer } from "ws";
import {VitalCode} from "../src/types";

const PORT = 8080;

const PATIENTS = [
  { id: "patient-1", name: "Alice Martin", bed: "Bed 1" },
  { id: "patient-2", name: "Robert Chen", bed: "Bed 2" },
  { id: "patient-3", name: "Sarah Johnson", bed: "Bed 3" },
  { id: "patient-4", name: "David Williams", bed: "Bed 4" },
];

// [code, loincCode, display, unit, ucumCode, start, min, max, step]
type VitalRow = [VitalCode, string, string, string, string, number, number, number, number];
type VitalState = { row: VitalRow; current: number };

const VITAL_ROWS: VitalRow[] = [
  ["HR", "8867-4", "Heart rate", "bpm", "/min", 72, 20, 200, 3],
  ["SPO2", "2708-6", "Oxygen saturation", "%", "%", 97, 70, 100, 1],
  ["SBP", "8480-6", "Systolic blood pressure", "mmHg", "mm[Hg]", 118, 50, 250, 4],
  ["DBP", "8462-4", "Diastolic blood pressure", "mmHg", "mm[Hg]", 76, 30, 150, 3],
  ["MAP", "8478-0", "Mean arterial pressure", "mmHg", "mm[Hg]", 90, 30, 150, 3],
  ["RR", "9279-1", "Respiratory rate", "breaths/min", "/min", 16, 4, 50, 1],
  ["TEMP", "8310-5", "Body temperature", "°C", "Cel", 36.8, 30, 43, 0.1],
  ["GCS", "9269-2", "Glasgow coma score", "score", "{score}", 15, 3, 15, 1],
];

function makeVitals(): VitalState[] {
  return VITAL_ROWS.map((row) => ({ row, current: row[5] }));
}

function walk(state: VitalState): void {
  const [, , , , , , min, max, step] = state.row;
  const next = state.current + (Math.random() - 0.5) * 2 * step;
  state.current = Math.max(min, Math.min(max, next));
}

function makeObservation(patientId: string, state: VitalState): object {
  const [code, loincCode, display, unit, ucumCode] = state.row;
  return {
    resourceType: "Observation",
    id: `${code.toLowerCase()}-${patientId}-${Date.now()}`,
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: loincCode, display }] },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: Math.round(state.current * 10) / 10,
      unit,
      system: "http://ucum.org",
      code: ucumCode,
    },
  };
}

const wss = new WebSocketServer({ port: PORT });
console.log(`Mock vitals server listening on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  const sessions = PATIENTS.map((p) => ({ patient: p, vitals: makeVitals() }));

  const delay = Math.random() * 10_000;
  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    for (const { patient, vitals } of sessions) {
      for (const state of vitals) {
        walk(state);
        ws.send(JSON.stringify(makeObservation(patient.id, state)));
      }
    }
  }, delay);

  ws.on("close", () => clearInterval(interval));
  ws.on("error", () => clearInterval(interval));
});
