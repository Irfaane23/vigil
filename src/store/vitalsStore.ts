import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ConnectionStatus } from "@/types/vitals";
import type { Patient, PatientSession } from "@/types/patient";
import type { VitalCode, VitalReading } from "@/types/vitals";

/**
 * Multi-patient vitals store.
 *
 * Both top-level maps are keyed by `patientId`, so any number of concurrent
 * patient streams can live in a single store instance:
 *
 *   patients[patientId]                -> PatientSession (identity + connection)
 *   readings[patientId][vitalCode]     -> VitalReading[] (ring-buffered)
 *
 * All actions accept `patientId` as their first argument. No per-patient
 * store instances are created; the WardView and BedsideView select against
 * the same single store.
 */

const MAX_READINGS = 720;

type VitalsState = {
  patients: Record<string, PatientSession>;
  readings: Record<string, Partial<Record<VitalCode, VitalReading[]>>>;
  registerPatient: (patient: Patient) => void;
  addReading: (reading: VitalReading) => void;
  setConnectionStatus: (patientId: string, status: ConnectionStatus) => void;
  getLatest: (patientId: string, code: VitalCode) => VitalReading | undefined;
  getHistory: (patientId: string, code: VitalCode, points: number) => VitalReading[];
};

export const useVitalsStore = create<VitalsState>()(
  immer((set, get) => ({
    patients: {},
    readings: {},

    registerPatient: (patient) =>
      set((state) => {
        if (!state.patients[patient.id]) {
          state.patients[patient.id] = {
            patient,
            connectionStatus: ConnectionStatus.LIVE,
            lastMessageAt: undefined,
          };
        }
      }),

    addReading: (reading) =>
      set((state) => {
        const { patientId, code } = reading;
        if (state.patients[patientId]) {
          state.patients[patientId].lastMessageAt = reading.timestamp;
          state.patients[patientId].connectionStatus = ConnectionStatus.LIVE;
        }
        if (!state.readings[patientId]) {
          state.readings[patientId] = {};
        }
        const buf = state.readings[patientId][code];
        if (!buf) {
          state.readings[patientId][code] = [reading];
        } else {
          buf.push(reading);
          if (buf.length > MAX_READINGS) {
            buf.shift();
          }
        }
      }),

    setConnectionStatus: (patientId, status) =>
      set((state) => {
        if (state.patients[patientId]) {
          state.patients[patientId].connectionStatus = status;
        }
      }),

    getLatest: (patientId, code) => {
      const buf = get().readings[patientId]?.[code];
      return buf && buf.length > 0 ? buf[buf.length - 1] : undefined;
    },

    getHistory: (patientId, code, points) => {
      const buf = get().readings[patientId]?.[code] ?? [];
      return buf.slice(-points);
    },
  })),
);
