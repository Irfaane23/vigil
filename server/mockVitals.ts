import { WebSocket, WebSocketServer } from "ws";

const PORT = 8080;

const PATIENTS = [
  { id: "patient-1", name: "Alice Martin", bed: "Bed 1" },
  { id: "patient-2", name: "Robert Chen", bed: "Bed 2" },
  { id: "patient-3", name: "Sarah Johnson", bed: "Bed 3" },
  { id: "patient-4", name: "David Williams", bed: "Bed 4" },
];

type VitalParam = {
  code: string;
  unit: string;
  current: number;
  min: number;
  max: number;
  step: number;
};

function makeVitals(): VitalParam[] {
  return [
    { code: "HR", unit: "bpm", current: 72, min: 20, max: 200, step: 3 },
    { code: "SPO2", unit: "%", current: 97, min: 70, max: 100, step: 1 },
    { code: "SBP", unit: "mmHg", current: 118, min: 50, max: 250, step: 4 },
    { code: "DBP", unit: "mmHg", current: 76, min: 30, max: 150, step: 3 },
    { code: "MAP", unit: "mmHg", current: 90, min: 30, max: 150, step: 3 },
    { code: "RR", unit: "breaths/min", current: 16, min: 4, max: 50, step: 1 },
    { code: "TEMP", unit: "°C", current: 36.8, min: 30, max: 43, step: 0.1 },
    { code: "GCS", unit: "score", current: 15, min: 3, max: 15, step: 1 },
  ];
}

function walk(vital: VitalParam): void {
  const next = vital.current + (Math.random() - 0.5) * 2 * vital.step;
  vital.current = Math.max(vital.min, Math.min(vital.max, next));
}

const wss = new WebSocketServer({ port: PORT });
console.log(`Mock vitals server listening on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  const sessions = PATIENTS.map((p) => ({ patient: p, vitals: makeVitals() }));

  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    for (const { patient, vitals } of sessions) {
      for (const vital of vitals) {
        walk(vital);
        ws.send(
          JSON.stringify({
            resourceType: "Observation",
            id: `${vital.code.toLowerCase()}-${patient.id}-${Date.now()}`,
            status: "final",
            code: { coding: [{ code: vital.code }] },
            subject: { reference: `Patient/${patient.id}` },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: {
              value: Math.round(vital.current * 10) / 10,
              unit: vital.unit,
            },
          }),
        );
      }
    }
  }, 1000);

  ws.on("close", () => clearInterval(interval));
  ws.on("error", () => clearInterval(interval));
});
