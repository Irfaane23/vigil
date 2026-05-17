import { WebSocket, WebSocketServer } from "ws";
import {VitalCode} from "../src/types";

const PORT = 8080;

interface PatientDef {
    id: string;
    name: string;
    bed: string;
    scenario: string;
}

const PATIENTS: PatientDef[] = [
    {
        id: "patient-1",
        name: "Alice Martin",
        bed: "Bed 1",
        scenario: "Stable post-op — no active alarms",
    },
    {
        id: "patient-2",
        name: "Robert Chen",
        bed: "Bed 2",
        scenario: "Advisory: mild hypertension + tachycardia",
    },
    {
        id: "patient-3",
        name: "Sarah Johnson",
        bed: "Bed 3",
        scenario: "Urgent: early septic shock (HR↑ SBP↓ Temp↑)",
    },
    {
        id: "patient-4",
        name: "David Williams",
        bed: "Bed 4",
        scenario: "Emergency: hypoxia + tachypnea (ARDS-like)",
    },
];

// [code, loincCode, display, unit, ucumCode, start, min, max, step]
type VitalRow = [VitalCode, string, string, string, string, number, number, number, number];
type VitalState = { row: VitalRow; current: number; min: number; max: number };

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

/**
 * Per-patient scenario overrides.
 *
 * Each entry tightens the random-walk band for one or more vitals so the
 * patient stays inside their clinical narrative - otherwise the walk drifts
 * back to baseline within minutes and the demo loses its alarm states.
 *
 * Tier mapping confirmation (from src/utils/thresholds.ts):
 *   HR    advisoryHigh=120, urgentHigh=150, emergencyHigh=180
 *   SBP   urgentLow=75, advisoryLow=85, advisoryHigh=160, urgentHigh=180
 *   SPO2  emergencyLow=80, urgentLow=88, advisoryLow=92
 *   RR    advisoryHigh=24, urgentHigh=28, emergencyHigh=35
 *   TEMP  advisoryHigh=38.5, urgentHigh=39.5, emergencyHigh=41.0
 */
type Override = { start: number; min: number; max: number };
const SCENARIOS: Record<string, Partial<Record<string, Override>>> = {
    "patient-1": {
        // Healthy baseline — defaults already in the normal range.
    },
    "patient-2": {
        HR: { start: 124, min: 121, max: 132 }, // ADVISORY high
        SBP: { start: 165, min: 162, max: 175 }, // ADVISORY high
    },
    "patient-3": {
        HR: { start: 154, min: 150, max: 168 }, // URGENT high
        SBP: { start: 80, min: 76, max: 84 }, // URGENT low
        TEMP: { start: 39.0, min: 38.7, max: 39.4 }, // ADVISORY high
    },
    "patient-4": {
        SPO2: { start: 79, min: 76, max: 82 }, // EMERGENCY low
        RR: { start: 32, min: 29, max: 36 }, // URGENT/EMERGENCY high
    },
};

function makeVitals(patientId: string): VitalState[] {
    const scenario = SCENARIOS[patientId] ?? {};
    return VITAL_ROWS.map((row) => {
        const [code, , , , , defStart, defMin, defMax] = row;
        const override = scenario[code];
        return {
            row,
            current: override?.start ?? defStart,
            min: override?.min ?? defMin,
            max: override?.max ?? defMax,
        };
    });
}

function walk(state: VitalState): void {
    const step = state.row[8];
    const next = state.current + (Math.random() - 0.5) * 2 * step;
    state.current = Math.max(state.min, Math.min(state.max, next));
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
            system: "http://unitsofmeasure.org",
            code: ucumCode,
        },
    };
}

const wss = new WebSocketServer({ port: PORT });
console.log(`Mock vitals server listening on ws://localhost:${PORT}`);
console.log(`Streaming ${PATIENTS.length} concurrent patients per connection:`);
for (const p of PATIENTS) {
    console.log(` ${p.id} : ${p.name} (${p.bed}) - ${p.scenario}`);
}

function emitTick(ws: WebSocket, sessions: { patient: PatientDef; vitals: VitalState[] }[]): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    for (const { patient, vitals } of sessions) {
        for (const state of vitals) {
            walk(state);
            ws.send(JSON.stringify(makeObservation(patient.id, state)));
        }
    }
}

wss.on("connection", (ws: WebSocket) => {
    const sessions = PATIENTS.map((p) => ({ patient: p, vitals: makeVitals(p.id) }));
    console.log(
        `[${new Date().toISOString()}] client connected — emitting initial burst for ${sessions.length} patients`,
    );

    // Initial burst: every patient gets one reading per vital the moment the
    // socket opens. Without this, the UI would stay empty for up to 1s after
    // connect — confusing during reconnect storms and contrary to the
    // "emits concurrently for all 4 patients from the moment the connection
    // opens" requirement.
    emitTick(ws, sessions);

    const interval = setInterval(() => emitTick(ws, sessions), 1000);

    ws.on("close", () => clearInterval(interval));
    ws.on("error", () => clearInterval(interval));
});
