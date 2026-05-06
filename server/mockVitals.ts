import { WebSocket, WebSocketServer } from "ws";

const PORT = 8080;

const PATIENTS = [
  { id: "patient-1", name: "Alice Martin", bed: "Bed 1" },
  { id: "patient-2", name: "Robert Chen", bed: "Bed 2" },
  { id: "patient-3", name: "Sarah Johnson", bed: "Bed 3" },
  { id: "patient-4", name: "David Williams", bed: "Bed 4" },
];

const VITAL_CODES = ["HR", "SPO2", "SBP", "DBP", "MAP", "RR", "TEMP", "GCS"];

const wss = new WebSocketServer({ port: PORT });
console.log(`Mock vitals server listening on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    for (const patient of PATIENTS) {
      for (const code of VITAL_CODES) {
        ws.send(
          JSON.stringify({
            resourceType: "Observation",
            id: `${code.toLowerCase()}-${patient.id}-${Date.now()}`,
            status: "final",
            code: { coding: [{ code }] },
            subject: { reference: `Patient/${patient.id}` },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: { value: 72, unit: "unit" },
          }),
        );
      }
    }
  }, 1000);

  ws.on("close", () => clearInterval(interval));
  ws.on("error", () => clearInterval(interval));
});
